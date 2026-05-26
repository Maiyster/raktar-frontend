import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Warehouse from '../Warehouse/Warehouse'; 
import styles from './Dashboard.module.css';
import Orders from '../Orders/Orders';
import Supplier from '../Supplier/Supplier';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [activeModule, setActiveModule] = useState('welcome');

    return (
        <div className={styles.dashboardContainer}>
            {/* Felső sáv */}
            <header className={styles.header}>
                <div className={styles.logoSection}>
                    <h1>Raktárkezelő Rendszer</h1>
                </div>
                <div className={styles.userInfo}>
                    <span>Felhasználó: <strong>{user?.username}</strong></span>
                    <button onClick={logout} className={styles.logoutBtn}>Kijelentkezés</button>
                </div>
            </header>

            <div className={styles.layoutBody}>
                {/* Oldalsó menü (Sidebar) */}
                <nav className={styles.sidebar}>
                    <ul className={styles.menuList}>
                        <li 
                            className={activeModule === 'welcome' ? styles.activeMenuItem : styles.menuItem}
                            onClick={() => setActiveModule('welcome')}
                        >
                            Kezdőlap
                        </li>
                        <li 
                            className={activeModule === 'whman' ? styles.activeMenuItem : styles.menuItem}
                            onClick={() => setActiveModule('whman')}
                        >
                            Raktárkezelés (Whman)
                        </li>
                        <li 
                            className={activeModule === 'supplier' ? styles.activeMenuItem : styles.menuItem}
                            onClick={() => setActiveModule('supplier')}
                        >
                            Beszállítói modul
                        </li>
                        <li 
                            className={activeModule === 'orders' ? styles.activeMenuItem : styles.menuItem}
                            onClick={() => setActiveModule('orders')}
                        >
                            Rendelések kezelése
                        </li>
                    </ul>
                </nav>

                {/* Dinamikus tartalomterület */}
                <main className={styles.mainContent}>
                    {activeModule === 'welcome' && (
                        <div className={styles.welcomeCard}>
                            <h2>Üdvözöljük a Raktárkezelő Rendszerben!</h2>
                            <p>Válasszon a bal oldali menüpontok közül a műveletek elvégzéséhez.</p>
                        </div>
                    )}
                    
                    {activeModule === 'whman' && <Warehouse />}
                    
                    {activeModule === 'supplier' && <Supplier />}
                    
                    {activeModule === 'orders' && <Orders />}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;