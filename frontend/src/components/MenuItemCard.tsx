import { MenuItem } from '../services/api';

interface MenuItemCardProps {
  item: MenuItem;
}

const availabilityLabel: Record<MenuItem['availability']['status'], string> = {
  available: 'Available',
  limited: 'Limited',
  sold_out: 'Sold out',
};

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const statusClass = `status-pill status-${item.availability.status}`;

  return (
    <article className="menu-item-card" aria-label={`${item.name} menu item`}>
      <div className="menu-item-header">
        <h3>{item.name}</h3>
        <span className={statusClass}>{availabilityLabel[item.availability.status]}</span>
      </div>
      {item.description ? <p className="menu-item-desc">{item.description}</p> : null}
      <p className="menu-item-price">
        {item.currency} {item.price.toFixed(2)}
      </p>
    </article>
  );
}
