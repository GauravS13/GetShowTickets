

interface CityIconProps {
  className?: string;
  size?: number;
}

const iconProps = {
  className: "w-16 h-16 text-primary",
  size: 64
};

export const MumbaiIcon = ({ className = iconProps.className, size = iconProps.size }: CityIconProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <rect x="16" y="20" width="32" height="24" fill="none" stroke="currentColor" strokeWidth="2" rx="2" />
    <path d="M24 20V8M40 20V8M24 44V56M40 44V56" stroke="currentColor" strokeWidth="2" />
    <path d="M28 32H36M30 28H34M30 36H34" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const DelhiNCRIcon = ({ className = iconProps.className, size = iconProps.size }: CityIconProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <circle cx="32" cy="32" r="20" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M32 12V52M12 32H52" stroke="currentColor" strokeWidth="2" />
    <circle cx="32" cy="32" r="4" fill="currentColor" />
  </svg>
);

export const BengaluruIcon = ({ className = iconProps.className, size = iconProps.size }: CityIconProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <rect x="20" y="16" width="24" height="32" fill="none" stroke="currentColor" strokeWidth="2" rx="2" />
    <path d="M20 24H44M20 32H44M20 40H44" stroke="currentColor" strokeWidth="2" />
    <circle cx="32" cy="28" r="2" fill="currentColor" />
  </svg>
);

export const HyderabadIcon = ({ className = iconProps.className, size = iconProps.size }: CityIconProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <rect x="20" y="16" width="24" height="32" fill="none" stroke="currentColor" strokeWidth="2" rx="2" />
    <path d="M20 24H44M20 32H44M20 40H44" stroke="currentColor" strokeWidth="2" />
    <circle cx="32" cy="28" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const ChennaiIcon = ({ className = iconProps.className, size = iconProps.size }: CityIconProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <rect x="20" y="16" width="24" height="32" fill="none" stroke="currentColor" strokeWidth="2" rx="2" />
    <path d="M32 20V44M24 32H40" stroke="currentColor" strokeWidth="2" />
    <circle cx="32" cy="32" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const KolkataIcon = ({ className = iconProps.className, size = iconProps.size }: CityIconProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <rect x="20" y="16" width="24" height="32" fill="none" stroke="currentColor" strokeWidth="2" rx="2" />
    <path d="M20 24H44M20 32H44M20 40H44" stroke="currentColor" strokeWidth="2" />
    <circle cx="32" cy="28" r="2" fill="currentColor" />
  </svg>
);

export const PuneIcon = ({ className = iconProps.className, size = iconProps.size }: CityIconProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <rect x="20" y="16" width="24" height="32" fill="none" stroke="currentColor" strokeWidth="2" rx="2" />
    <path d="M20 24H44M20 32H44M20 40H44" stroke="currentColor" strokeWidth="2" />
    <circle cx="32" cy="28" r="2" fill="currentColor" />
  </svg>
);

export const AhmedabadIcon = ({ className = iconProps.className, size = iconProps.size }: CityIconProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <rect x="20" y="16" width="24" height="32" fill="none" stroke="currentColor" strokeWidth="2" rx="2" />
    <path d="M20 24H44M20 32H44M20 40H44" stroke="currentColor" strokeWidth="2" />
    <circle cx="32" cy="28" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const GoaIcon = ({ className = iconProps.className, size = iconProps.size }: CityIconProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <rect x="20" y="16" width="24" height="32" fill="none" stroke="currentColor" strokeWidth="2" rx="2" />
    <path d="M20 24H44M20 32H44M20 40H44" stroke="currentColor" strokeWidth="2" />
    <circle cx="32" cy="32" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const JaipurIcon = ({ className = iconProps.className, size = iconProps.size }: CityIconProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <rect x="20" y="16" width="24" height="32" fill="none" stroke="currentColor" strokeWidth="2" rx="2" />
    <path d="M20 24H44M20 32H44M20 40H44" stroke="currentColor" strokeWidth="2" />
    <circle cx="32" cy="28" r="2" fill="currentColor" />
  </svg>
);

// City icon mapping
export const cityIcons = {
  "Mumbai": MumbaiIcon,
  "Delhi": DelhiNCRIcon,
  "Bangalore": BengaluruIcon,
  "Hyderabad": HyderabadIcon,
  "Chennai": ChennaiIcon,
  "Kolkata": KolkataIcon,
  "Pune": PuneIcon,
  "Ahmedabad": AhmedabadIcon,
  "Goa": GoaIcon,
  "Jaipur": JaipurIcon,
} as const;

export type CityName = keyof typeof cityIcons;
