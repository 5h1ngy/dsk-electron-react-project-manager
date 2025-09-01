import { ComponentType, JSX, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@renderer/store';

function withPublicRoute<P extends JSX.IntrinsicAttributes & { children?: ReactNode }>(
    WrappedComponent: ComponentType<P>,
    opts: { children?: React.ReactNode; redirect?: string }
): React.FC<P> {
    const { children, redirect = '/login' } = opts;

    return (props) => {
        const { isAuthenticated } = useSelector((state: RootState) => state.auth);
        if (isAuthenticated) return <Navigate to={redirect} replace />;

        return !children
            ? <WrappedComponent {...props} />
            : <WrappedComponent {...props}>{children}</WrappedComponent>;
    };
};

export default withPublicRoute;