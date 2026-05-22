const colors = [
  "bg-red-500/20 text-red-500",
  "bg-blue-500/20 text-blue-500",
  "bg-green-500/20 text-green-500",
  "bg-yellow-500/20 text-yellow-600",
  "bg-purple-500/20 text-purple-500",
  "bg-pink-500/20 text-pink-500",
  "bg-indigo-500/20 text-indigo-500",
  "bg-teal-500/20 text-teal-600",
  "bg-orange-500/20 text-orange-500",
  "bg-cyan-500/20 text-cyan-600",
];

export const getAvatarColor = (identifier) => {
  if (!identifier) return colors[0];
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export const isDefaultAvatar = (pic) => {
  return pic === "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg" || !pic;
};
