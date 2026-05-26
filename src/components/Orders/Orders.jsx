import React, { useState, useContext } from 'react';
import { axiosPrivate } from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import styles from './Orders.module.css';

const Orders = () => {
    const { user } = useContext(AuthContext);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    
    const [orderData, setOrderData] = useState({
        address: {
            country: 'Magyarország',
            postal_code: '',
            city: '',
            street: '',
            house_number: '',
            details: ''
        },
        products: [{ product_id: '', quantity: 1 }]
    });

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setOrderData(prev => ({
            ...prev,
            address: { ...prev.address, [name]: value }
        }));
    };

    const handleProductChange = (index, e) => {
        const { name, value } = e.target;
        const newProducts = [...orderData.products];
        newProducts[index][name] = name === 'product_id' || name === 'quantity' ? Number(value) : value;
        setOrderData({ ...orderData, products: newProducts });
    };

    const addProductRow = () => {
        setOrderData({
            ...orderData,
            products: [...orderData.products, { product_id: '', quantity: 1 }]
        });
    };

    const removeProductRow = (index) => {
        const newProducts = orderData.products.filter((_, i) => i !== index);
        setOrderData({ ...orderData, products: newProducts });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMessage({ type: '', text: '' });

        try {
            const payload = {
                address: orderData.address,
                products: orderData.products.filter(p => p.product_id > 0 && p.quantity > 0)
            };

            const response = await axiosPrivate.post('delivery/place_order', payload);
            setStatusMessage({ type: 'success', text: `Sikeres rendelés! Azonosító: ${response.data.tracking_number || response.data.delivery_id}` });
            
            // Űrlap alaphelyzetbe állítása sikeres rendelés után
            setOrderData(prev => ({ ...prev, products: [{ product_id: '', quantity: 1 }] }));
        } catch (error) {
            setStatusMessage({ type: 'error', text: 'Hiba történt a rendelés leadásakor. Ellenőrizze az adatokat!' });
        }
    };

    return (
        <div className={styles.ordersContainer}>
            <h2>Új rendelés leadása</h2>
            <p className={styles.description}>Kérem, adja meg a szállítási adatokat és a kívánt termékeket.</p>

            {statusMessage.text && (
                <div className={`${styles.alert} ${styles[statusMessage.type]}`}>
                    {statusMessage.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className={styles.orderForm}>
                <div className={styles.formSection}>
                    <h3>Szállítási Cím</h3>
                    <div className={styles.formGrid}>
                        <div className={styles.inputGroup}>
                            <label>Ország</label>
                            <input type="text" name="country" value={orderData.address.country} onChange={handleAddressChange} required />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Irányítószám</label>
                            <input type="text" name="postal_code" value={orderData.address.postal_code} onChange={handleAddressChange} required />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Város</label>
                            <input type="text" name="city" value={orderData.address.city} onChange={handleAddressChange} required />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Utca</label>
                            <input type="text" name="street" value={orderData.address.street} onChange={handleAddressChange} required />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Házszám</label>
                            <input type="text" name="house_number" value={orderData.address.house_number} onChange={handleAddressChange} required />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Egyéb részletek</label>
                            <input type="text" name="details" value={orderData.address.details} onChange={handleAddressChange} />
                        </div>
                    </div>
                </div>

                <div className={styles.formSection}>
                    <h3>Termékek</h3>
                    {orderData.products.map((product, index) => (
                        <div key={index} className={styles.productRow}>
                            <div className={styles.inputGroup}>
                                <label>Termék ID</label>
                                <input type="number" min="1" name="product_id" value={product.product_id} onChange={(e) => handleProductChange(index, e)} required />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Mennyiség</label>
                                <input type="number" min="1" name="quantity" value={product.quantity} onChange={(e) => handleProductChange(index, e)} required />
                            </div>
                            {orderData.products.length > 1 && (
                                <button type="button" onClick={() => removeProductRow(index)} className={styles.removeBtn}>Törlés</button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={addProductRow} className={styles.addBtn}>+ Új termék hozzáadása</button>
                </div>

                <button type="submit" className={styles.submitBtn}>Rendelés véglegesítése</button>
            </form>
        </div>
    );
};

export default Orders;