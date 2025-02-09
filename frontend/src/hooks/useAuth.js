import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../.env';
import { useAuthContext } from '../context/AuthContext'; // Import the AuthContext

const useAuth = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn } = useAuthContext(); // Update global auth state

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');

    // Helper function to get the refresh token from cookies
    const getRefreshTokenFromCookies = () => {
      const refreshTokenCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('refreshToken='));
      return refreshTokenCookie ? refreshTokenCookie.split('=')[1] : null;
    };

    // Function to regenerate the access token using the refresh token
    const regenerateAccessToken = async (refreshToken) => {
      try {
        const response = await axios.post(`${BASE_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        });

        if (response.data && response.data.access) {
          // Store the new access token
          sessionStorage.setItem('accessToken', response.data.access);
          setIsLoggedIn(true); // Set global auth state to true
        } else {
          // If the refresh token is invalid, navigate to the login page
          setIsLoggedIn(false);
          navigate('/login');
        }
      } catch (error) {
        console.error('Error refreshing token:', error.response?.data || error.message);
        setIsLoggedIn(false);
        navigate('/login'); // Redirect to login on failure
      }
    };

    if (!token) {
      const refreshToken = getRefreshTokenFromCookies();
      if (refreshToken) {
        regenerateAccessToken(refreshToken);
      } else {
        setIsLoggedIn(false);
        navigate('/login'); // If no tokens are available, redirect to login
      }
    } else {
      setIsLoggedIn(true); // If the token exists, set global auth state to true
    }
  }, [navigate, setIsLoggedIn]);
};

export default useAuth;
