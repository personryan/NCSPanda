import { MenuItem } from '../services/api';
import MenuItemCard from './MenuItemCard';

interface MenuListProps {
  items: MenuItem[];
}

function byCategory(items: MenuItem[]) {
  return {
    Available: items.filter((i) => i.availability.status === 'available'),
    Limited: items.filter((i) => i.availability.status === 'limited'),
    'Sold Out': items.filter((i) => i.availability.status === 'sold_out'),
  };
}

export default function MenuList({ items }: MenuListProps) {
  if (!items.length) {
    return <p className="menu-empty">No menu items available for this outlet.</p>;
  }

  const groups = byCategory(items);

  return (
    <div className="menu-groups">
      {Object.entries(groups).map(([category, categoryItems]) =>
        categoryItems.length ? (
          <section key={category} className="menu-group">
            <h2>{category}</h2>
            <div className="menu-grid">
              {categoryItems.map((item) => (
                <MenuItemCard key={item.itemId} item={item} />
              ))}
            </div>
          </section>
        ) : null,
      )}
    </div>
  );
}
