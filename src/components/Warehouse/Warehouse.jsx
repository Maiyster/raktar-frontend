import React, { useEffect, useState } from 'react';
import { axiosPrivate } from '../../api/axios';
import styles from './Warehouse.module.css';

const Warehouse = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const availableCouriers = [
        { id: 1, name: 'Szabó Gábor (Futár)' },
        { id: 2, name: 'Kovács Péter (Express)' },
        { id: 3, name: 'Nagy Lajos (Logisztika)' }
    ];

    const allLocations = ['1/1', '1/2', '1/3', '2/1', '2/2', '2/3', '3/1', '3/2'];

    useEffect(() => {
        const fetchDeliveries = async () => {
            try {
                const response = await axiosPrivate.get('delivery/all');
                const formattedData = response.data.map(item => ({
                    ...item,
                    status: item.status || 'PENDING',
                    courier_id: item.courier?.id || '',
                    location: item.location || ''
                }));
                setDeliveries(formattedData);
                setLoading(false);
            } catch (err) {
                setError('Nem sikerült lekérni a szállítási adatokat. Biztosítottunk tesztadatokat a felület működéséhez.');
                // Biztonsági mentés: ha a backend nem elérhető, tesztadatokkal demonstráltam a felületet
                setDeliveries([
                    { delivery_id: 1, customer_id: 2, status: 'PENDING', tracking_number: 'TRK1776869592XKBQMW', delivery_time_estimate: '3-5 business days', courier_id: '', location: '' },
                    { delivery_id: 2, customer_id: 2, status: 'PENDING', tracking_number: 'TRK1776871657A6IOPH', delivery_time_estimate: '3-5 business days', courier_id: '', location: '' },
                    { delivery_id: 3, customer_id: 4, status: 'PENDING', tracking_number: 'TRK1776880545G0PBKX', delivery_time_estimate: '3-5 business days', courier_id: '', location: '' }
                ]);
                setLoading(false);
            }
        };

        fetchDeliveries();
    }, []);

    
    const handleStatusChange = (trackingNumber, newStatus) => {
        setDeliveries(prev => prev.map(d => {
            if (d.tracking_number === trackingNumber) {
                if (newStatus !== 'APPROVED') {
                    return { ...d, status: newStatus, courier_id: '', location: '' };
                }
                return { ...d, status: newStatus };
            }
            return d;
        }));
    };
    
    const handleCourierAssign = (trackingNumber, courierId) => {
        setDeliveries(prev => prev.map(d => 
            d.tracking_number === trackingNumber ? { ...d, courier_id: courierId } : d
        ));
    };

    const handleLocationAssign = (trackingNumber, location) => {
        setDeliveries(prev => prev.map(d => 
            d.tracking_number === trackingNumber ? { ...d, location: location } : d
        ));
    };

    const occupiedLocations = deliveries.map(d => d.location).filter(loc => loc !== '');

    if (loading) return <div className={styles.statusMessage}>Adatok betöltése folyamatban...</div>;

    return (
        <div className={styles.warehouseContainer}>
            <div className={styles.tableHeaderSection}>
                <h2>Raktári kiszállítások kezelése</h2>
                <p>Összes belső rendelés és szállítási státusz kezelése.</p>
            </div>

            {error && <div className={styles.errorBanner}>{error}</div>}

            {deliveries.length === 0 ? (
                <p className={styles.noData}>Nincs megjeleníthető szállítási feladat.</p>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.deliveryTable}>
                        <thead>
                            <tr>
                                <th>Szállítási ID</th>
                                <th>Ügyfél ID</th>
                                <th>Státusz</th>
                                <th>Fuvarozó hozzárendelés</th>
                                <th>Raktárhely</th>
                                <th>Követési szám</th>
                                <th>Becsült idő</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deliveries.map((delivery) => (
                                // Itt is kulcsként a tracking_number-t használtam mert nem tudom a delivery_id-t, segíts kérlek Kinga :((()))
                                <tr key={delivery.tracking_number}>
                                    <td>#{delivery.delivery_id || '-'}</td>
                                    <td>{delivery.customer_id}</td>

                                    <td>
                                        <select 
                                            value={delivery.status} 
                                            onChange={(e) => handleStatusChange(delivery.tracking_number, e.target.value)}
                                            className={`${styles.actionSelect} ${
                                                delivery.status === 'APPROVED' ? styles.statusApproved : 
                                                delivery.status === 'CANCELLED' ? styles.statusCancelled : 
                                                styles.statusPending
                                            }`}
                                        >
                                            <option value="PENDING">PENDING</option>
                                            <option value="APPROVED">APPROVED</option>
                                            <option value="CANCELLED">CANCELLED</option>
                                        </select>
                                    </td>

                                    
                                    <td>
                                        {delivery.status === 'APPROVED' ? (
                                            <select 
                                                value={delivery.courier_id} 
                                                onChange={(e) => handleCourierAssign(delivery.tracking_number, e.target.value)}
                                                className={styles.actionSelect}
                                            >
                                                <option value="">-- Válasszon fuvarozót --</option>
                                                {availableCouriers.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className={styles.disabledText}>Jóváhagyásra vár</span>
                                        )}
                                    </td>

                                    <td>
                                        {delivery.status === 'APPROVED' ? (
                                            <select 
                                                value={delivery.location} 
                                                onChange={(e) => handleLocationAssign(delivery.tracking_number, e.target.value)}
                                                className={styles.actionSelect}
                                            >
                                                <option value="">-- Polc kiválasztása --</option>
                                                {allLocations.map(loc => {
                                                    const isOccupied = occupiedLocations.includes(loc) && delivery.location !== loc;
                                                    return (
                                                        <option key={loc} value={loc} disabled={isOccupied}>
                                                            {loc} {isOccupied ? '(Foglalt)' : ''}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        ) : (
                                            <span className={styles.disabledText}>-</span>
                                        )}
                                    </td>
                                    
                                    <td>{delivery.tracking_number || 'Nincs generálva'}</td>
                                    <td>{delivery.delivery_time_estimate || 'Nincs megadva'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            
            <div className={styles.capacitySection}>
                <h3>Raktárhelyek Foglaltsági Állapota (Élő kapacitás kijelzés)</h3>
                <div className={styles.gridContainer}>
                    {allLocations.map(loc => {
                        const isOccupied = occupiedLocations.includes(loc);
                        return (
                            <div 
                                key={loc} 
                                className={`${styles.gridCell} ${isOccupied ? styles.cellOccupied : styles.cellFree}`}
                            >
                                <span className={styles.cellTitle}>Polc: {loc}</span>
                                <span className={styles.cellStatus}>
                                    {isOccupied ? 'FOGLALT' : 'SZABAD'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Warehouse;