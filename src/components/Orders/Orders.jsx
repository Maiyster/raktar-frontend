import React, { useState, useEffect, useContext } from 'react';
import { axiosPrivate } from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import styles from './Orders.module.css';

const Orders = () => {
    const { user } = useContext(AuthContext);
    
    const [activeTab, setActiveTab] = useState('create');
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

    const [myOrders, setMyOrders] = useState([]);
    const [filterStatus, setFilterStatus] = useState('All');
    const [listLoading, setListLoading] = useState(false);
    const [listError, setListError] = useState('');

    useEffect(() => {
        if (activeTab === 'list') {
            fetchMyOrders();
        }
    }, [activeTab, filterStatus]);

    const fetchMyOrders = async () => {
        setListLoading(true);
        setListError('');
        try {
            // TODO: Amikor a backend elkészül a listázó végponttal ide kell tenni a dolgokat ha minden igaz :D
            throw new Error('Backend végpont még nem elérhető.');
        } catch (error) {
            setListError('Nem sikerült lekérni a valós adatokat a backendről. Tesztadatok megjelenítése.');
            
            const mockData = [
                { delivery_id: 101, tracking_number: 'TRK987654321', order_date: '2026-05-26T10:00:00', status: 'Pending', products_count: 2 },
                { delivery_id: 102, tracking_number: 'TRK123456789', order_date: '2026-05-22T14:30:00', status: 'Dispatched', products_count: 5 },
                { delivery_id: 103, tracking_number: 'TRK555555555', order_date: '2026-05-15T09:15:00', status: 'Delivered', products_count: 1 },
                { delivery_id: 104, tracking_number: 'TRK999888777', order_date: '2026-05-25T16:45:00', status: 'Pending', products_count: 3 }
            ];

            if (filterStatus === 'All') {
                setMyOrders(mockData);
            } else {
                setMyOrders(mockData.filter(o => o.status === filterStatus));
            }
        } finally {
            setListLoading(false);
        }
    };

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
            const response = await axiosPrivate.post('order/place_order', payload);
            setStatusMessage({ type: 'success', text: `Sikeres rendelés! Azonosító: ${response.data.tracking_number || response.data.delivery_id}` });
            setOrderData(prev => ({ ...prev, products: [{ product_id: '', quantity: 1 }] }));
        } catch (error) {
            setStatusMessage({ type: 'error', text: 'Hiba történt a rendelés leadásakor. Ellenőrizze az adatokat!' });
        }
    };

    const isWithin24Hours = (dateString) => {
        const orderDate = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.abs(now - orderDate) / 36e5;
        return diffInHours <= 24;
    };

    return (
        <div className={styles.ordersContainer}>
            {/* Navigációs fülek */}
            <div className={styles.tabContainer}>
                <button 
                    className={`${styles.tabButton} ${activeTab === 'create' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('create')}
                >
                    Új rendelés leadása
                </button>
                <button 
                    className={`${styles.tabButton} ${activeTab === 'list' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('list')}
                >
                    Rendeléseim áttekintése
                </button>
            </div>

            {/* ÚJ RENDELÉS LEADÁSA FÜL */}
            {activeTab === 'create' && (
                <div>
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
                                    <div className={styles.actionGroup}>
                                        {orderData.products.length > 1 && (
                                            <button type="button" onClick={() => removeProductRow(index)} className={styles.removeBtn}>Törlés</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addProductRow} className={styles.addBtn}>+ Új termék hozzáadása</button>
                        </div>

                        <button type="submit" className={styles.submitBtn}>Rendelés véglegesítése</button>
                    </form>
                </div>
            )}

            {/* RENDELÉSEK ÁTTEKINTÉSE FÜL */}
            {activeTab === 'list' && (
                <div>
                    <h2>Korábbi és aktuális rendelések</h2>
                    <p className={styles.description}>Itt tekintheti meg a leadott rendeléseit. A rendelések módosítására a leadástól számított 24 órán belül van lehetőség.</p>

                    <div className={styles.filterSection}>
                        <label>Státusz szűrés: </label>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={styles.filterSelect}>
                            <option value="All">Összes mutatása</option>
                            <option value="Pending">Pending (Feldolgozás alatt)</option>
                            <option value="Dispatched">Dispatched (Összekészítve)</option>
                            <option value="Shipped">Shipped (Kiszállítás alatt)</option>
                            <option value="Delivered">Delivered (Kézbesítve)</option>
                            <option value="Cancelled">Cancelled (Törölve)</option>
                        </select>
                    </div>

                    {listError && <div className={styles.errorBanner}>{listError}</div>}

                    {listLoading ? (
                        <div className={styles.statusMessage}>Adatok betöltése folyamatban...</div>
                    ) : myOrders.length === 0 ? (
                        <p className={styles.noDataText}>Nincs megjeleníthető rendelés a megadott feltételekkel.</p>
                    ) : (
                        <div className={styles.tableWrapper}>
                            <table className={styles.deliveryTable}>
                                <thead>
                                    <tr>
                                        <th>Rendelés ID</th>
                                        <th>Követési szám</th>
                                        <th>Rendelés Dátuma</th>
                                        <th>Tételek száma</th>
                                        <th>Státusz</th>
                                        <th>Műveletek</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myOrders.map((order) => {
                                        const canEdit = isWithin24Hours(order.order_date) && order.status === 'Pending';
                                        
                                        return (
                                            <tr key={order.delivery_id}>
                                                <td>#{order.delivery_id}</td>
                                                <td>{order.tracking_number || '-'}</td>
                                                <td>{new Date(order.order_date).toLocaleString('hu-HU')}</td>
                                                <td>{order.products_count} db</td>
                                                <td>
                                                    <span className={`${styles.statusBadge} ${styles[order.status?.toLowerCase()] || styles.defaultStatus}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {canEdit ? (
                                                        <button className={styles.editBtn}>Módosítás</button>
                                                    ) : (
                                                        <span className={styles.disabledAction}>Lezárva</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Orders;