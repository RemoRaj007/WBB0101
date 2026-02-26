import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { dispatch, setMemoryToken } from '../../network/dispatch';
import { jwtDecode } from 'jwt-decode';

interface User {
    employeeId?: string;
    name?: string;
    id: number;
    username: string;
    email: string;
    role: string;
    district?: string;
    avatar?: string;
    phoneNumber?: string;
    bio?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    updateUser: (userData: User) => void; // Added
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // Try to get a fresh access token using the HttpOnly cookie
                const response = await dispatch.get('/auth/refresh');
                const accessToken = response.data?.accessToken;

                if (accessToken) {
                    setMemoryToken(accessToken);
                    setToken(accessToken);
                    // Fetch full user profile
                    try {
                        const profileRes = await dispatch.get('/users/me');
                        setUser(profileRes.data);
                    } catch (err) {
                        const decoded: any = jwtDecode(accessToken);
                        setUser({
                            id: decoded.id,
                            username: decoded.username,
                            email: decoded.email || '',
                            role: decoded.role,
                            district: decoded.district,
                        });
                    }
                }
            } catch (error) {
                console.log("No active session restored");
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = (accessToken: string, userData: User) => {
        setMemoryToken(accessToken);
        setToken(accessToken);
        setUser(userData);
    };

    const updateUser = (userData: User) => {
        setUser(userData);
    };

    const logout = async () => {
        try {
            await dispatch.post('/auth/logout');
        } catch (e) {
            console.error("Logout failed", e);
        }
        setMemoryToken(null);
        setToken(null);
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser, isAuthenticated: !!user, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
