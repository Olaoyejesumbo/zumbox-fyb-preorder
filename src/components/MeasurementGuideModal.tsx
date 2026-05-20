"use client";

interface MeasurementGuideModalProps {
  open: boolean;
  onClose: () => void;
}

const GUIDE_ITEMS = [
  {
    label: "Chest / Bust",
    instruction:
      "Measure around the fullest part of your chest, keeping the tape parallel to the floor. Breathe naturally.",
  },
  {
    label: "Waist",
    instruction:
      "Measure around your natural waistline — the narrowest part of your torso, where you bend side to side.",
  },
  {
    label: "Hips",
    instruction:
      "Measure around the fullest part of your hips, about 7–9 inches below your natural waist.",
  },
  {
    label: "Shoulder Width",
    instruction:
      "Measure from one shoulder point to the other across your upper back, following the curve of your shoulders.",
  },
  {
    label: "Shirt Length",
    instruction:
      "Measure from the base of your neck at the back, down to where you want the shirt hem to end.",
  },
  {
    label: "Shorts / Skirt Length",
    instruction:
      "Measure from your natural waist downward to where you want the hem of your shorts or skirt to fall.",
  },
];

export default function MeasurementGuideModal({
  open,
  onClose,
}: MeasurementGuideModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Measurement Guide"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ebony/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg bg-cream border border-gold/30 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-forest text-cream px-6 py-5 flex items-start justify-between">
          <div>
            <h2 className="font-syne font-bold text-lg tracking-wide uppercase">
              Measurement Guide
            </h2>
            <p className="text-gold text-xs mt-1 tracking-widest">
              All measurements in inches
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-cream/60 hover:text-cream text-2xl leading-none ml-4 mt-0.5"
            aria-label="Close guide"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          <p className="text-sm text-ebony/70 font-dm leading-relaxed">
            Use a flexible measuring tape for accurate results. Have a friend
            help where possible. Stand straight and relaxed for all
            measurements.
          </p>

          {GUIDE_ITEMS.map((item) => (
            <div
              key={item.label}
              className="border-l-2 border-gold pl-4 py-1"
            >
              <p className="font-syne font-bold text-sm uppercase tracking-wide text-forest mb-1">
                {item.label}
              </p>
              <p className="text-sm text-ebony/80 font-dm leading-relaxed">
                {item.instruction}
              </p>
            </div>
          ))}

          <div className="bg-burgundy/10 border border-burgundy/20 px-4 py-3 mt-4">
            <p className="text-xs text-burgundy font-dm leading-relaxed">
              <strong>Tip:</strong> When in doubt, measure twice and record the
              larger number — it&apos;s easier to take in than to let out.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full bg-forest text-cream font-syne font-bold text-sm tracking-widest uppercase py-3 hover:bg-burgundy transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
