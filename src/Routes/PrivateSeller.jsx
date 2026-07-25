import React from 'react';
import PrivateRole from './PrivateRole';

const PrivateSeller = ({ children }) => (
    <PrivateRole allowedRoles={['Seller']}>{children}</PrivateRole>
);

export default PrivateSeller;
