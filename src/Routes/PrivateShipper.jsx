import React from 'react';
import PrivateRole from './PrivateRole';

const PrivateShipper = ({ children }) => (
    <PrivateRole allowedRoles={['Shipper']}>{children}</PrivateRole>
);

export default PrivateShipper;
