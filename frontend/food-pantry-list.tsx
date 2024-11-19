import React, { useState } from 'react';
import { Trash2, Edit2 } from 'lucide-react';

const FoodPantryList = () => {
  const [items, setItems] = useState([
    { id: 1, name: 'Black beans (canned)', available: true, limit: 'No limit' },
    { id: 2, name: 'Black beans (dried)', available: true, limit: 'No limit' },
    { id: 3, name: 'Chickpea / Garbanzo beans (canned)', available: false, limit: 'No limit' },
    { id: 4, name: 'Dark red kidney beans (canned)', available: false, limit: 'No limit' },
    { id: 5, name: 'Dark red kidney beans (dried)', available: false, limit: 'No limit' },
    { id: 6, name: 'Light red kidney beans (canned)', available: false, limit: 'No limit' },
    { id: 7, name: 'Refried beans (canned)', available: true, limit: '2' },
  ]);

  const toggleAvailability = (id) => {
    setItems(items.map(item => 
      item.id === id ? {...item, available: !item.available} : item
    ));
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Beans</h1>
      <ul>
        {items.map(item => (
          <li key={item.id} className="mb-4 p-2 border rounded">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={item.available}
                onChange={() => toggleAvailability(item.id)}
                className="mr-2"
              />
              <span className={item.available ? 'font-semibold' : ''}>{item.name}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <div>
                <span className="text-sm text-gray-600">Limit: {item.limit}</span>
                <button className="ml-2 text-sm text-blue-500">-</button>
                <button className="ml-2 text-sm text-blue-500">+</button>
              </div>
              <div>
                <button className="mr-2"><Edit2 size={16} /></button>
                <button><Trash2 size={16} color="red" /></button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <button className="bg-black text-white px-4 py-2 rounded mr-2">Add new item</button>
        <button className="bg-blue-500 text-white px-4 py-2 rounded">Save changes</button>
      </div>
    </div>
  );
};

export default FoodPantryList;
