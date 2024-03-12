import Navbar from '@/components/Navbar'
import { Outlet } from 'react-router-dom'
import N8nChat from './N8nChat'
import { useSelector } from 'react-redux';

const MainLayout = () => {
  const { user } = useSelector((store) => store.auth);
  return (
    <div className='flex flex-col min-h-screen relative'>
        <Navbar/>
        <div className='flex-1 mt-16 relative'>
            <Outlet/>
        </div>
        <N8nChat userId={user?.email} />
    </div>
  )
}

export default MainLayout