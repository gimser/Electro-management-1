
import React from 'react';
import { HelpCircle } from 'lucide-react';

// Converted snippet into a valid React component to resolve compiler errors
const NavItemPlaceholder = () => {
  const NavItem = ({ name, icon }: { id: string, name: string, icon: React.ReactNode }) => (
    <div className="flex items-center gap-2 p-2">
      {icon}
      <span>{name}</span>
    </div>
  );

  return (
    <div className="p-4 bg-white rounded shadow">
       <NavItem id="gim-ai" name="المستشار التقني لـ GIM" icon={<HelpCircle size={18} />} />
    </div>
  );
};

export default NavItemPlaceholder;
