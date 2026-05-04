import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import MultiFileUpload from '../components/ui/MultiFileUpload';
import { PackagePlus, Tag, ArrowLeft, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateListingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    price: '',
    condition: 'New',
    location: '',
    contact: '',
    description: '',
  });
  const [marketplaceImages, setMarketplaceImages] = useState([]);

  const categories = ['Books', 'Electronics', 'Furniture', 'Clothing', 'Services', 'Other', 'General'];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFilesChange = (files) => {
    setMarketplaceImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!marketplaceImages || marketplaceImages.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    
    marketplaceImages.forEach((file) => {
      data.append('marketplaceImages', file);
    });

    try {
      await client.post('/marketplace', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Product successfully listed!');
      navigate('/marketplace');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Listing failed to post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/marketplace')}
          className="p-3 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-2xl shadow-sm border border-slate-100 transition-all font-bold"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight flex items-center gap-3">
            <PackagePlus className="w-8 h-8 text-primary" /> Create Listing
          </h1>
          <p className="text-slate-500 font-medium tracking-tight">Sell an item to fellow students</p>
        </div>
      </div>

      <Card className="!p-8 !rounded-[32px] border-none shadow-xl shadow-slate-200/50">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-900 tracking-tight border-b border-slate-100 pb-4">Basic Details</h3>
            
            <Input 
              label="Listing Title" 
              name="title" 
              placeholder="e.g. MacBook Pro M2, Principles of Economics Book"
              value={formData.title} 
              onChange={handleInputChange} 
              required 
              className="rounded-2xl"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-slate-400" /> Category
                </label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleInputChange}
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-slate-900"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <Input 
                label="Price ($)" 
                name="price" 
                type="number" 
                placeholder="0.00"
                value={formData.price} 
                onChange={handleInputChange} 
                required 
                className="rounded-2xl"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Condition</label>
                <select 
                  name="condition" 
                  value={formData.condition} 
                  onChange={handleInputChange}
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-slate-900"
                >
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Parts Only">Parts Only</option>
                </select>
              </div>
              <Input 
                label="Location (Optional)" 
                name="location" 
                placeholder="e.g. North Campus Dorms"
                value={formData.location} 
                onChange={handleInputChange} 
                className="rounded-2xl"
              />
            </div>

             <Input 
              label="Contact Info" 
              name="contact" 
              placeholder="How should buyers reach you? (Phone, Email, WhatsApp)"
              value={formData.contact} 
              onChange={handleInputChange} 
              required 
              className="rounded-2xl"
            />
          </div>

          <div className="space-y-4">
             <h3 className="text-xl font-black text-slate-900 tracking-tight border-b border-slate-100 pb-4">Description</h3>
             <textarea 
              name="description" 
              rows="5" 
              placeholder="Describe the item, features, reason for selling, and any defects..."
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium text-slate-900 resize-none leading-relaxed"
              value={formData.description}
              onChange={handleInputChange}
              required
            ></textarea>
          </div>

          <div className="space-y-4">
             <h3 className="text-xl font-black text-slate-900 tracking-tight border-b border-slate-100 pb-4">Photos</h3>
             <MultiFileUpload 
                label="Upload Product Images"
                description="Drag & drop multiple high-quality photos"
                onFilesChange={handleFilesChange}
                maxFiles={5}
                accept="image/png, image/jpeg, image/jpg, image/webp"
             />
          </div>

          <div className="pt-6 flex items-center justify-end border-t border-slate-100">
             <Button 
                type="submit" 
                loading={loading}
                disabled={loading}
                className="rounded-2xl font-black h-14 px-12 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all text-lg"
              >
                Publish Listing
             </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateListingPage;
