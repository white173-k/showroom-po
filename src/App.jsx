import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import JsBarcode from 'jsbarcode';
import { LayoutDashboard, Barcode, Boxes, Download, Upload, Printer, Plus } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([
    { id: 1, name: 'Slim Fit Denim Shirt', sku: 'SH-101', price: 1299, size: 'L', stock: 45 },
    { id: 2, name: 'Cotton Chino Trousers', sku: 'PT-202', price: 1899, size: '32', stock: 30 },
    { id: 3, name: 'Formal White Shirt', sku: 'SH-103', price: 999, size: 'M', stock: 12 },
    { id: 4, name: 'Casual Cargo Pants', sku: 'PT-204', price: 2199, size: '34', stock: 8 }
  ]);

  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newSize, setNewSize] = useState('');
  const [newStock, setNewStock] = useState('');

  const [selectedBarcode, setSelectedBarcode] = useState('SH-101');
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'barcode' && barcodeRef.current) {
      JsBarcode(barcodeRef.current, selectedBarcode, {
        format: 'CODE128',
        width: 2,
        height: 80,
        displayValue: true
      });
    }
  }, [selectedBarcode, activeTab]);

  const addProduct = (e) => {
    e.preventDefault();
    if (!newName || !newPrice || !newSize || !newStock) return alert('Sari details bharein!');

    const prefix = newName.toLowerCase().includes('pant') ? 'PT-' : 'SH-';
    const randomNum = Math.floor(100 + Math.random() * 900);
    const autoSku = `${prefix}${randomNum}`;

    const newProd = {
      id: Date.now(),
      name: newName,
      sku: autoSku,
      price: Number(newPrice),
      size: newSize,
      stock: Number(newStock)
    };

    setProducts((prev) => [...prev, newProd]);
    setSelectedBarcode(autoSku);
    setNewName('');
    setNewPrice('');
    setNewSize('');
    setNewStock('');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(products);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Showroom Stock');
    XLSX.writeFile(workbook, 'Showroom_Stock_Report.xlsx');
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      const importedProducts = data.map((item, index) => ({
        id: Date.now() + index,
        name: item.name || 'Unknown Item',
        sku: item.sku || 'SKU-' + Math.floor(100 + Math.random() * 900),
        price: Number(item.price) || 0,
        size: String(item.size) || 'M',
        stock: Number(item.stock) || 0
      }));
      setProducts((prev) => [...prev, ...importedProducts]);
    };
    reader.readAsBinaryString(file);
  };

  const printBarcode = () => {
    const printContent = document.getElementById('printable-barcode-area').innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    window.location.reload();
  };

  const totalAvailableStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const lowStockCount = products.filter((p) => p.stock < 15).length;

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex' }}>
      <div style={{ width: '260px', background: '#0f172a', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h2 style={{ fontSize: '20px', color: '#38bdf8', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>👔 Showroom POS</h2>

        <button onClick={() => setActiveTab('dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: activeTab === 'dashboard' ? '#1e293b' : 'transparent', color: 'white', border: 'none', padding: '12px', width: '100%', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', fontSize: '16px' }}>
          <LayoutDashboard size={20} /> Dashboard
        </button>

        <button onClick={() => setActiveTab('barcode')} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: activeTab === 'barcode' ? '#1e293b' : 'transparent', color: 'white', border: 'none', padding: '12px', width: '100%', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', fontSize: '16px' }}>
          <Barcode size={20} /> Barcode Generator
        </button>

        <button onClick={() => setActiveTab('stock')} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: activeTab === 'stock' ? '#1e293b' : 'transparent', color: 'white', border: 'none', padding: '12px', width: '100%', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', fontSize: '16px' }}>
          <Boxes size={20} /> Stock Manager
        </button>
      </div>

      <div style={{ flex: 1, padding: '30px' }}>
        {activeTab === 'dashboard' && (
          <div>
            <h1 style={{ color: '#1e293b', marginTop: 0 }}>📊 Showroom Live Overview</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '6px solid #3b82f6' }}>
                <h3 style={{ color: '#64748b', margin: 0 }}>Total Catalog Items</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0', color: '#1e293b' }}>{products.length}</p>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '6px solid #10b981' }}>
                <h3 style={{ color: '#64748b', margin: 0 }}>Total Showroom Pieces</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0', color: '#10b981' }}>{totalAvailableStock} Pcs</p>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '6px solid #f59e0b' }}>
                <h3 style={{ color: '#64748b', margin: 0 }}>Total Stock Value</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0', color: '#1e293b' }}>₹{totalInventoryValue}/-</p>
              </div>
            </div>

            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginTop: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3>⚠️ Low Stock Alerts (Less than 15 pieces)</h3>
              <p style={{ color: '#64748b' }}>Currently {lowStockCount} item categories need refilling.</p>
            </div>
          </div>
        )}

        {activeTab === 'barcode' && (
          <div>
            <h1 style={{ color: '#1e293b', marginTop: 0 }}>🏷️ Barcode Printing & Excel Integration</h1>

            <div style={{ display: 'flex', gap: '15px', background: 'white', padding: '15px', borderRadius: '8px', marginBottom: '25px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <button onClick={exportToExcel} style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                <Download size={18} /> Export Stock to Excel
              </button>

              <label style={{ background: '#6366f1', color: 'white', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                <Upload size={18} /> Import Data from Excel
                <input type="file" accept=".xlsx, .xls" onChange={handleImportExcel} style={{ display: 'none' }} />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3>Select Item to Print Sticker</h3>
                <select value={selectedBarcode} onChange={(e) => setSelectedBarcode(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '16px', marginBottom: '20px' }}>
                  {products.map((p) => (
                    <option key={p.id} value={p.sku}>{p.name} - {p.sku} ({p.size})</option>
                  ))}
                </select>

                <div style={{ textAlign: 'center', padding: '20px', background: '#f8fafc', borderRadius: '8px' }}>
                  <div id="printable-barcode-area" style={{ background: 'white', padding: '20px', display: 'inline-block' }}>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>MY SHOWROOM</h4>
                    <svg ref={barcodeRef}></svg>
                  </div>
                  <div style={{ marginTop: '15px' }}>
                    <button onClick={printBarcode} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                      <Printer size={18} /> Print Sticker (Thermal Printer)
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3>➕ Add New Item (Auto SKU Barcode Generation)</h3>
                <form onSubmit={addProduct} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input type="text" placeholder="Item Name (e.g., Slim Fit Cotton Shirt, Denim Jeans)" value={newName} onChange={(e) => setNewName(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  <input type="number" placeholder="Price (₹)" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  <input type="text" placeholder="Size (e.g., M, L, XL, 32, 34)" value={newSize} onChange={(e) => setNewSize(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  <input type="number" placeholder="Initial Stock Quantity" value={newStock} onChange={(e) => setNewStock(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  <button type="submit" style={{ background: '#0f172a', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' }}>
                    <Plus size={18} /> Generate Barcode & Add Item
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stock' && (
          <div>
            <h1 style={{ color: '#1e293b', marginTop: 0 }}>📦 Showroom Real-Time Stock Tab</h1>

            <div style={{ background: '#1e293b', color: 'white', padding: '40px 30px', borderRadius: '16px', marginBottom: '30px', display: 'flex', justifyContent: 'between', alignItems: 'center', boxShadow: '0 4px 15px rgba(15, 23, 42, 0.15)' }}>
              <div>
                <span style={{ textTransform: 'uppercase', trackingSpace: '1px', fontSize: '14px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Current Live Status</span>
                <span style={{ fontSize: '20px', color: '#38bdf8', fontWeight: 'bold' }}>Total Pieces Available in Showroom Floor:</span>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <h1 style={{ fontSize: '72px', margin: 0, fontWeight: '900', color: '#22c55e', lineHeight: '1' }}>{totalAvailableStock}</h1>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>Units Ready to Sell</span>
              </div>
            </div>

            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ marginTop: 0, marginBottom: '15px' }}>All Showroom Stock Details</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '12px' }}>Item Name</th>
                    <th style={{ padding: '12px' }}>SKU/Barcode Number</th>
                    <th style={{ padding: '12px' }}>Size</th>
                    <th style={{ padding: '12px' }}>Price</th>
                    <th style={{ padding: '12px' }}>Stock Units</th>
                    <th style={{ padding: '12px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#334155' }}>{p.name}</td>
                      <td style={{ padding: '12px' }}><code style={{ background: '#f1f5f9', padding: '3px 6px', borderRadius: '4px' }}>{p.sku}</code></td>
                      <td style={{ padding: '12px' }}><strong>{p.size}</strong></td>
                      <td style={{ padding: '12px' }}>₹{p.price}</td>
                      <td style={{ padding: '12px', fontSize: '18px', fontWeight: 'bold', color: p.stock < 15 ? '#ef4444' : '#1e293b' }}>{p.stock} pcs</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', background: p.stock < 15 ? '#fee2e2' : '#d1fae5', color: p.stock < 15 ? '#ef4444' : '#065f46' }}>
                          {p.stock < 15 ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
