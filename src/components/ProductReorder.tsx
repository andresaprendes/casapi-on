import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ArrowUpDown, Save, RotateCcw } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  display_order?: number;
}

interface ProductReorderProps {
  onReorder?: () => void;
}

const ProductReorder: React.FC<ProductReorderProps> = ({ onReorder }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'https://casa-pinon-backend-production.up.railway.app';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/products`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(products);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update display_order based on new positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      display_order: index
    }));

    setProducts(updatedItems);
  };

  const saveOrder = async () => {
    setSaving(true);
    try {
      // Update each product's display_order
      const updatePromises = products.map((product, index) =>
        fetch(`${apiUrl}/api/products/${product.id}/order`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ displayOrder: index })
        })
      );

      await Promise.all(updatePromises);
      
      if (onReorder) {
        onReorder();
      }
      
      alert('Product order saved successfully!');
    } catch (error) {
      console.error('Error saving product order:', error);
      alert('Error saving product order');
    } finally {
      setSaving(false);
    }
  };

  const resetOrder = async () => {
    if (!confirm('Are you sure you want to reset the product order?')) return;
    
    setSaving(true);
    try {
      const response = await fetch(`${apiUrl}/api/products/sync`, {
        method: 'POST'
      });
      
      if (response.ok) {
        await fetchProducts();
        if (onReorder) {
          onReorder();
        }
        alert('Product order reset to default!');
      }
    } catch (error) {
      console.error('Error resetting product order:', error);
      alert('Error resetting product order');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <ArrowUpDown className="w-5 h-5" />
          Reorder Products
        </h2>
        <div className="flex gap-2">
          <button
            onClick={resetOrder}
            disabled={saving}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={saveOrder}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Order'}
          </button>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-600">
        Drag and drop products to reorder them. Click "Save Order" to apply changes.
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="products">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {products.map((product, index) => (
                <Draggable key={product.id} draggableId={product.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`
                        p-4 border rounded-lg cursor-move transition-all
                        ${snapshot.isDragging 
                          ? 'bg-blue-50 border-blue-300 shadow-lg' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800">{product.name}</h3>
                            <p className="text-sm text-gray-600">${product.price?.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          Position: {product.display_order ?? index}
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default ProductReorder;
