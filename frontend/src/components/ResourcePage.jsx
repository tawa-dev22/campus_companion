import { useEffect, useState } from 'react';
import client from '../api/client';

function inferInitialState(fields) {
  return fields.reduce((acc, field) => {
    acc[field.name] = field.type === 'number' ? 0 : '';
    return acc;
  }, {});
}

export default function ResourcePage({ title, endpoint, fields }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(inferInitialState(fields));
  const [editingId, setEditingId] = useState(null);

  async function fetchItems() {
    const { data } = await client.get(endpoint);
    setItems(data);
  }

  useEffect(() => {
    fetchItems();
  }, [endpoint]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editingId) {
      await client.put(`${endpoint}/${editingId}`, form);
    } else {
      await client.post(endpoint, form);
    }
    setEditingId(null);
    setForm(inferInitialState(fields));
    fetchItems();
  }

  function handleEdit(item) {
    setEditingId(item._id);
    const next = inferInitialState(fields);
    fields.forEach((field) => { next[field.name] = item[field.name] ?? next[field.name]; });
    setForm(next);
  }

  async function handleDelete(id) {
    await client.delete(`${endpoint}/${id}`);
    fetchItems();
  }

  return (
    <div className="page-grid">
      <section className="card form-card">
        <h2>{editingId ? `Edit ${title}` : `Add ${title}`}</h2>
        <form className="grid-form" onSubmit={handleSubmit}>
          {fields.map((field) => (
            <label key={field.name}>
              <span>{field.label}</span>
              {field.type === 'textarea' ? (
                <textarea name={field.name} value={form[field.name]} onChange={handleChange} placeholder={field.placeholder || ''} />
              ) : (
                <input
                  type={field.type || 'text'}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder || ''}
                  required={field.required}
                />
              )}
            </label>
          ))}
          <button className="primary-btn" type="submit">{editingId ? 'Update' : 'Create'}</button>
        </form>
      </section>

      <section className="card list-card">
        <h2>{title} Records</h2>
        <div className="records">
          {items.length === 0 ? <p className="muted">No records found.</p> : items.map((item) => (
            <article className="record-item" key={item._id}>
              <div>
                <h3>{item.title || item.name || item.courseTitle}</h3>
                <pre>{JSON.stringify(item, null, 2)}</pre>
              </div>
              <div className="row-actions">
                <button className="secondary-btn" onClick={() => handleEdit(item)}>Edit</button>
                <button className="danger-btn" onClick={() => handleDelete(item._id)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
