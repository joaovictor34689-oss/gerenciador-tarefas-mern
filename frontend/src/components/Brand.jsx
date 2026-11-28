import { CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Brand() {
  return (
    <Link className="brand" to="/">
      <span className="brand-icon">
        <CheckCheck size={25} />
      </span>
      em dia<span className="brand-dot">.</span>
    </Link>
  );
}
