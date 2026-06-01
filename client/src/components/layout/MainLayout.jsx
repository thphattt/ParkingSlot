import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = () => {
  return (
    <div className="relative min-h-screen bg-background">
      <Sidebar />
      <div className="min-h-screen transition-all duration-300 ease-in-out md:pl-64">
        <Header />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;