import React from 'react';
import PrivateRole from './PrivateRole';

const PrivateAdmin = ({ children }) => (
    <PrivateRole allowedRoles={['Admin']}>{children}</PrivateRole>
);

export default PrivateAdmin;
