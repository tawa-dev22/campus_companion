import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client, { getBackendUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { Plus, Search, Tag, Phone, ShoppingCart, Trash2, Edit, Image as ImageIcon, Sparkles, Filter, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const MarketplacePage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMessaging, setIsMessaging] = useState(false);
  const { user, isAdmin, isSystemAdmin } = useAuth();
  
  const canManage = (item) => {
    const itemUserId = typeof item.user === 'object' ? item.user?._id : item.user;
    return isAdmin || isSystemAdmin || itemUserId === user?._id;
  };

  const fetchItems = async () => {
    try {
      const response = await client.get('/marketplace');
      setItems(response.items || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load marketplace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing? This action is permanent.')) {
      try {
        await client.delete(`/marketplace/${id}`);
        toast.success('Listing removed');
        fetchItems();
        if (selectedItem?._id === id) setIsModalOpen(false);
      } catch (error) {
        toast.error('Deletion failed');
      }
    }
  };

  const handleOpenItem = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleInterest = async () => {
    if (!user) {
      toast.error('Please log in to contact the seller');
      return;
    }

    if (user._id === selectedItem.user?._id) {
      toast.error('This is your own listing!');
      return;
    }

    setIsMessaging(true);
    try {
      await client.post('/messages', {
        receiverId: selectedItem.user?._id || selectedItem.user,
        productId: selectedItem._id,
        message: 'Is this still available?',
      });
      toast.success('Message sent to seller!');
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsMessaging(false);
    }
  };

  const categories = ['All', 'Books', 'Electronics', 'Furniture', 'Clothing', 'Services', 'Other'];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <div className="space-y-10 animate-fade-in pb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="violet" className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border-none">
                Student Exchange
              </Badge>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">Marketplace</h1>
            <p className="text-lg text-slate-500 font-medium tracking-tight">Buy, sell, or trade items with fellow students.</p>
          </div>
          <Button onClick={() => navigate('/marketplace/create')} className="rounded-2xl shadow-lg shadow-primary/20 font-black h-12 px-6">
            <Plus className="w-5 h-5 mr-2" />
            Sell an Item
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Categories */}
          <aside className="lg:w-64 shrink-0">
            <Card className="!p-4 !rounded-[28px] border-none shadow-xl shadow-slate-200/40 sticky top-28">
              <div className="flex items-center gap-2 px-3 mb-4">
                <Filter className="w-4 h-4 text-slate-400" />
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">Categories</h3>
              </div>
              <nav className="space-y-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                      selectedCategory === cat 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20 translate-x-1' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <ChevronRight className="w-4 h-4" />}
                  </button>
                ))}
              </nav>
            </Card>
          </aside>

          <div className="flex-1 space-y-8">
            {/* Search Header */}
            <div className="flex items-center gap-4 bg-white p-2 rounded-[28px] shadow-xl shadow-slate-200/40 border border-slate-100">
              <div className="flex items-center gap-3 flex-1 pl-4 h-12">
                <Search className="w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search for books, laptops, dorm gear..." 
                  className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 font-medium outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {[1,2,3,4,5,6].map(i => <div key={i} className="h-96 bg-slate-50 rounded-[32px] animate-pulse border border-slate-100"></div>)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredItems.map((item) => (
                  <Card 
                    key={item._id} 
                    className="!p-0 !rounded-[32px] overflow-hidden border-none shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 transform hover:-translate-y-2 flex flex-col h-full group cursor-pointer relative z-10"
                    onClick={() => handleOpenItem(item)}
                  >
                    <div className="h-60 overflow-hidden relative">
                      {/* Hover Overlay */}
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenItem(item);
                        }}
                        className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center"
                      >
                        <div className="bg-white/90 backdrop-blur-md px-6 py-2 rounded-2xl shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <span className="text-primary font-black text-sm uppercase tracking-widest">View Details</span>
                        </div>
                      </div>

                      {item.images && item.images.length > 0 ? (
                        <img 
                          src={`${getBackendUrl()}/${item.images[0].replace('\\', '/')}`} 
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center text-slate-200 group-hover:bg-slate-100 transition-colors">
                          <ImageIcon className="w-16 h-16 mb-2 opacity-50" />
                          <span className="text-xs font-black uppercase tracking-widest">No Photos Provided</span>
                        </div>
                      )}
                      <div className="absolute top-5 left-5 z-20">
                        <Badge variant="primary" className="!bg-white !text-slate-900 font-black px-4 py-1.5 rounded-xl border-none shadow-xl text-lg">${item.price}</Badge>
                      </div>
                      <div className="absolute bottom-5 right-5 z-20">
                        <Badge className="glass !bg-black/60 !text-white font-bold px-3 py-1 rounded-lg border-none">{item.condition || 'Used'}</Badge>
                      </div>
                    </div>

                    <div className="p-8 flex-1 flex flex-col relative z-20">
                      <div className="mb-4">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h3>
                        <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest flex items-center gap-2">
                          <Tag className="w-3 h-3" />
                          {item.category}
                        </p>
                      </div>

                      <p className="text-sm text-slate-500 font-medium line-clamp-3 leading-relaxed mb-6 flex-1">
                        {item.description || 'No detailed description provided by the seller.'}
                      </p>
                      
                      <div className="flex flex-wrap items-center justify-between pt-6 border-t border-slate-100 mt-auto gap-4">
                        <div className="flex flex-col min-w-[120px]">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seller Contact</span>
                          <div className="flex items-center gap-2 text-slate-900">
                            <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span className="text-sm font-black truncate">{item.contact}</span>
                          </div>
                        </div>
                        
                        {canManage(item) && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item._id);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors rounded-xl font-black text-[10px] uppercase tracking-widest shrink-0 ml-auto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
                {filteredItems.length === 0 && (
                  <div className="col-span-full py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                    <ShoppingCart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 text-xl font-bold tracking-tight">Nothing here yet!</p>
                    <Button variant="outline" onClick={() => setSelectedCategory('All')} className="mt-4 rounded-xl font-black">Browse All Categories</Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Product Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedItem?.title}
        maxWidth="2xl"
      >
        {selectedItem && (
          <div className="space-y-6">
            <div className="aspect-video rounded-2xl overflow-hidden bg-slate-50 relative">
              {selectedItem.images && selectedItem.images.length > 0 ? (
                <img 
                  src={`${getBackendUrl()}/${selectedItem.images[0].replace('\\', '/')}`} 
                  alt={selectedItem.title}
                  className="w-full h-full object-contain bg-slate-900"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
                  <ImageIcon className="w-20 h-20 mb-2 opacity-50" />
                  <span className="text-sm font-black uppercase tracking-widest">No Photos</span>
                </div>
              )}
              <div className="absolute top-4 left-4">
                <Badge variant="primary" className="!bg-white !text-slate-900 font-black px-4 py-1.5 rounded-xl border-none shadow-xl text-xl">${selectedItem.price}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</p>
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <Tag className="w-4 h-4 text-primary" />
                  {selectedItem.category}
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Condition</p>
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  {selectedItem.condition || 'Used'}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Description</h4>
              <p className="text-slate-600 leading-relaxed font-medium">
                {selectedItem.description || 'No detailed description provided by the seller.'}
              </p>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Seller Info</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
                    {selectedItem.user?.fullName?.[0] || 'S'}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">{selectedItem.user?.fullName || 'Anonymous'}</p>
                    <p className="text-xs font-bold text-slate-500">{selectedItem.contact}</p>
                  </div>
                </div>
              </div>

              {/* Interest / Manage Button */}
              {(() => {
                const ownerId = selectedItem.user?._id || selectedItem.user;
                const isOwner = user?._id === ownerId;
                
                if (isOwner) {
                  return (
                    <Button 
                      variant="outline" 
                      onClick={() => handleDelete(selectedItem._id)}
                      className="rounded-xl font-black text-rose-600 border-rose-200 hover:bg-rose-50 px-6 h-12"
                    >
                      <Trash2 className="w-5 h-5 mr-2" />
                      Delete Listing
                    </Button>
                  );
                }

                return (
                  <Button 
                    onClick={handleInterest} 
                    loading={isMessaging}
                    className="rounded-xl font-black px-6 h-12 shadow-lg shadow-primary/20"
                  >
                    Is this still available?
                  </Button>
                );
              })()}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};


export default MarketplacePage;
