import type { FC } from 'react';
import { HomeComponentWrapper, Content, Login } from './HomeComponent.styled';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth/auth.store';

interface HomeComponentProps {}

const HomeComponent: FC<HomeComponentProps> = () => {
   const navigate = useNavigate();
   const authStore = useAuthStore();

   const handleLogin = async () => {
      try {
         await authStore.login('google.com');
         navigate('/items');
      } catch (error) {
         console.error('Login failed:', error);
      }
   }
   
   return (
      <HomeComponentWrapper>
         <Content>
            <h1>Welcome to GameList!</h1>
            <Login onClick={handleLogin}>Login</Login>
         </Content>
         
      </HomeComponentWrapper>
   );
};

export default HomeComponent;
