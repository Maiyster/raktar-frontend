import React, { useState } from 'react';
import { axiosPrivate } from '../../api/axios';
import styles from './Supplier.module.css';

const Supplier = () => {
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    
    const [shipmentData, setShipmentData] = useState({
        items: [{ product_id: '', shipped_quantity: 1, price_mod: 0 }]
    });

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...shipmentData.items];
        newItems[index][name] = Number(value);
        setShipmentData({ items: newItems });
    };

    const addItemRow = () => {
        setShipmentData({
            items: [...shipmentData.items, { product_id: '', shipped_quantity: 1, price_mod: 0 }]
        });
    };

    const removeItemRow = (index) => {
        const newItems = shipmentData.items.filter((_, i) => i !== index);
        setShipmentData({ items: newItems });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMessage({ type: '', text: '' });

        try {
            const payload = {
                items: shipmentData.items.filter(item => item.product_id > 0 && item.shipped_quantity > 0)
            };

            await axiosPrivate.post('supplier/create_shipment', payload);

            setStatusMessage({ type: 'success', text: 'A szállítmány sikeresen rögzítve a rendszerben!' });
            
            setShipmentData({ items: [{ product_id: '', shipped_quantity: 1, price_mod: 0 }] });
        } catch (error) {
            setStatusMessage({ type: 'error', text: 'Hiba a szállítmány rögzítésekor. Ellenőrizze a backend kapcsolatot!' });
        }
    };

    return (
        <div className={styles.supplierContainer}>
            <h2>Beszállítói modul: Új szállítmány rögzítése</h2>
            <p className={styles.description}>Kérem, adja meg a beérkező termékeket és azok mennyiségét.</p>

            {statusMessage.text && (
                <div className={`${styles.alert} ${styles[statusMessage.type]}`}>
                    {statusMessage.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className={styles.supplierForm}>
                <div className={styles.formSection}>
                    <h3>Beszállított Tételek</h3>
                    
                    <div className={styles.tableHeader}>
                        <div className={styles.headerCell}>Termék ID</div>
                        <div className={styles.headerCell}>Mennyiség (db)</div>
                        <div className={styles.headerCell}>Ár módosító (opcionális)</div>
                        <div className={styles.headerCell}>Művelet</div>
                    </div>

                    {shipmentData.items.map((item, index) => (
                        <div key={index} className={styles.itemRow}>
                            <div className={styles.inputGroup}>
                                <input type="number" min="1" name="product_id" placeholder="ID" value={item.product_id} onChange={(e) => handleItemChange(index, e)} required />
                            </div>
                            <div className={styles.inputGroup}>
                                <input type="number" min="1" name="shipped_quantity" placeholder="Mennyiség" value={item.shipped_quantity} onChange={(e) => handleItemChange(index, e)} required />
                            </div>
                            <div className={styles.inputGroup}>
                                <input type="number" step="0.01" name="price_mod" placeholder="0.00" value={item.price_mod} onChange={(e) => handleItemChange(index, e)} />
                            </div>
                            <div className={styles.actionGroup}>
                                {shipmentData.items.length > 1 && (
                                    <button type="button" onClick={() => removeItemRow(index)} className={styles.removeBtn}>Törlés</button>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    <button type="button" onClick={addItemRow} className={styles.addBtn}>+ Új tétel hozzáadása</button>
                </div>

                <button type="submit" className={styles.submitBtn}>Szállítmány beküldése</button>
            </form>
        </div>
    );
};

export default Supplier;