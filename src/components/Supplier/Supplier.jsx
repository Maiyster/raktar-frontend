import React, { useState, useEffect } from 'react';
import { axiosPrivate } from '../../api/axios';
import styles from './Supplier.module.css';

const Supplier = () => {
    const [activeTab, setActiveTab] = useState('create');
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    const getDefaultArrivalDate = () => {
        const date = new Date();
        date.setDate(date.getDate() + 4);
        return date.toISOString().split('T')[0];
    };

    const [shipmentData, setShipmentData] = useState({
        arrival_date: getDefaultArrivalDate(),
        items: [{ product_id: '', shipped_quantity: 1, price_mod: 0 }]
    });

    const [myShipments, setMyShipments] = useState([]);
    const [filterStatus, setFilterStatus] = useState('All');
    const [listLoading, setListLoading] = useState(false);
    const [listError, setListError] = useState('');

    useEffect(() => {
        if (activeTab === 'list') {
            fetchMyShipments();
        }
    }, [activeTab, filterStatus]);

    const fetchMyShipments = async () => {
        setListLoading(true);
        setListError('');
        try {
            const endpoint = filterStatus === 'All' ? 'supplier/get_myshipment/all' : `supplier/get_myshipment/${filterStatus}`;
            const response = await axiosPrivate.get(endpoint);
            setMyShipments(response.data);
        } catch (err) {
            console.error("Adatlekérési hiba", err);
            setListError('Nem sikerült lekérni az adatokat a backendről. Tesztadatok megjelenítése.');
            
            const mockData = [
                { id: 1, tracking_number: 'TRK1776764230E2RJ8Y', status: 'Received', arrival_date: '2026-06-01', items_count: 3 },
                { id: 2, tracking_number: 'TRK1776869592XKBQMW', status: 'Pending', arrival_date: '2026-06-02', items_count: 1 },
                { id: 4, tracking_number: 'TRK1776959308PCW1YT', status: 'Dispatched', arrival_date: '2026-05-30', items_count: 5 },
                { id: 6, tracking_number: 'TRK1772854111XKBQMW', status: 'BySupplier', arrival_date: '2026-06-05', items_count: 2 },
            ];

            if (filterStatus === 'All') {
                setMyShipments(mockData);
            } else {
                setMyShipments(mockData.filter(s => s.status === filterStatus));
            }
        } finally {
            setListLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShipmentData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...shipmentData.items];
        newItems[index][name] = Number(value);
        setShipmentData(prev => ({ ...prev, items: newItems }));
    };

    const addItemRow = () => {
        setShipmentData(prev => ({
            ...prev,
            items: [...prev.items, { product_id: '', shipped_quantity: 1, price_mod: 0 }]
        }));
    };

    const removeItemRow = (index) => {
        const newItems = shipmentData.items.filter((_, i) => i !== index);
        setShipmentData(prev => ({ ...prev, items: newItems }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMessage({ type: '', text: '' });

        try {
            const payload = {
                arrival_date: shipmentData.arrival_date,
                items: shipmentData.items.filter(item => item.product_id > 0 && item.shipped_quantity > 0)
            };
            
            await axiosPrivate.post('supplier/create_shipment', payload);

            setStatusMessage({ type: 'success', text: 'A szállítmány és a várható érkezési dátum sikeresen rögzítve!' });
            setShipmentData({
                arrival_date: getDefaultArrivalDate(),
                items: [{ product_id: '', shipped_quantity: 1, price_mod: 0 }]
            });
        } catch (error) {
            setStatusMessage({ type: 'error', text: 'Hiba a szállítmány rögzítésekor. Ellenőrizze a hálózati kapcsolatot!' });
        }
    };

    return (
        <div className={styles.supplierContainer}>
            <div className={styles.tabContainer}>
                <button 
                    className={`${styles.tabButton} ${activeTab === 'create' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('create')}
                >
                    Új szállítmány rögzítése
                </button>
                <button 
                    className={`${styles.tabButton} ${activeTab === 'list' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('list')}
                >
                    Szállítmányaim áttekintése
                </button>
            </div>

            {activeTab === 'create' && (
                <div>
                    <h2>Beszállítói modul: Új szállítmány rögzítése</h2>
                    <p className={styles.description}>Kérem, adja meg a beérkező termékeket, a mennyiséget és a várható érkezési időt.</p>

                    {statusMessage.text && (
                        <div className={`${styles.alert} ${styles[statusMessage.type]}`}>
                            {statusMessage.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.supplierForm}>
                        <div className={styles.formSection}>
                            <h3>Szállítási paraméterek</h3>
                            <div className={styles.dateInputGroup}>
                                <label htmlFor="arrival_date">Várható érkezési dátum (Automatikusan 3-5 napra kalkulálva):</label>
                                <input 
                                    type="date" 
                                    id="arrival_date"
                                    name="arrival_date" 
                                    value={shipmentData.arrival_date} 
                                    onChange={handleInputChange}
                                    required 
                                />
                            </div>
                        </div>

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
            )}

            {activeTab === 'list' && (
                <div>
                    <h2>Összes rögzített rendelés (Beszállítói nézet)</h2>
                    <p className={styles.description}>Itt követheti nyomon az összes rögzített szállítmány státuszát és részleteit.</p>

                    <div className={styles.filterSection}>
                        <label>Státusz szűrés: </label>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={styles.filterSelect}>
                            <option value="All">Összes mutatása</option>
                            <option value="Pending">Pending (Függőben)</option>
                            <option value="BySupplier">BySupplier (Beszállítónál)</option>
                            <option value="Dispatched">Dispatched (Feladva)</option>
                            <option value="Received">Received (Beérkezett)</option>
                        </select>
                    </div>

                    {listError && <div className={styles.errorBanner}>{listError}</div>}

                    {listLoading ? (
                        <div className={styles.statusMessage}>Adatok betöltése folyamatban...</div>
                    ) : myShipments.length === 0 ? (
                        <p className={styles.noDataText}>Nincs megjeleníthető szállítmány a megadott feltételekkel.</p>
                    ) : (
                        <div className={styles.tableWrapper}>
                            <table className={styles.deliveryTable}>
                                <thead>
                                    <tr>
                                        <th>Szállítmány ID</th>
                                        <th>Követési szám</th>
                                        <th>Várható érkezés</th>
                                        <th>Tételek száma</th>
                                        <th>Státusz</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myShipments.map((shipment) => (
                                        <tr key={shipment.id}>
                                            <td>#{shipment.id}</td>
                                            <td>{shipment.tracking_number || '-'}</td>
                                            <td>{shipment.arrival_date || '-'}</td>
                                            <td>{shipment.items_count} db</td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${styles[shipment.status?.toLowerCase()] || styles.defaultStatus}`}>
                                                    {shipment.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Supplier;