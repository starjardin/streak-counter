interface UserAvatarProps {
  displayName: string;
}

export function UserAvatar({ displayName }: UserAvatarProps) {
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div
      title={`Logged in as ${displayName}`}
      className="w-9 h-9 rounded-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center select-none cursor-default shrink-0"
    >
      {initials}
    </div>
  );
}
