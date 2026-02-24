import { PickupSlot } from '../../services/api';

interface SlotPickerProps {
  slots: PickupSlot[];
  selectedSlotId: string;
  onSelect: (slotId: string) => void;
}

export default function SlotPicker({ slots, selectedSlotId, onSelect }: SlotPickerProps) {
  if (!slots.length) {
    return <p className="menu-empty">No pickup slots available for selected date.</p>;
  }

  return (
    <div className="slot-grid">
      {slots.map((slot) => (
        <button
          key={slot.slotId}
          type="button"
          className={`slot-pill ${selectedSlotId === slot.slotId ? 'slot-selected' : ''}`}
          disabled={!slot.isAvailable}
          onClick={() => onSelect(slot.slotId)}
        >
          <span>{slot.startTime} - {slot.endTime}</span>
          <small>{slot.available} left</small>
        </button>
      ))}
    </div>
  );
}
