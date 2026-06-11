export const POINTS_MAP: Record<string, number> = {
  FRIDAY_SESSION: 10,
  WORKSHOP: 15,
  HACKATHON: 30,
  COMMUNITY_EVENT: 15,
  RESEARCH: 25,
  LEADERSHIP: 20,
  INNOVATION_CHALLENGE: 40,
};

export const POINTS_LABELS: Record<string, string> = {
  FRIDAY_SESSION: "Friday Session Attendance",
  WORKSHOP: "Workshop Attendance",
  HACKATHON: "Hackathon Participation",
  COMMUNITY_EVENT: "Community Event Attendance",
  RESEARCH: "Research Participation",
  LEADERSHIP: "Leadership Activity",
  INNOVATION_CHALLENGE: "Innovation Challenge Participation",
};

export const EVENT_CATEGORY_LABELS: Record<string, string> = {
  FRIDAY_SESSION: "Friday Session",
  WORKSHOP: "Workshop",
  HACKATHON: "Hackathon",
  COMMUNITY_MEETUP: "Community Meetup",
  RESEARCH_EVENT: "Research Event",
  INNOVATION_CHALLENGE: "Innovation Challenge",
  CAREER_TALK: "Career Talk",
  OTHER: "Other",
};

export const ROLE_LABELS: Record<string, string> = {
  MEMBER: "Member",
  PRESIDENT: "President",
  VICE_PRESIDENT: "Vice President",
  GENERAL_SECRETARY: "General Secretary",
  ASST_GEN_SECRETARY: "Assistant General Secretary",
  SPEAKER: "Speaker",
  TECHNICAL_DIRECTOR: "Technical Director",
  SUPER_ADMIN: "Super Admin",
};

export const AUTHORIZED_SCAN_ROLES = [
  "PRESIDENT",
  "VICE_PRESIDENT",
  "GENERAL_SECRETARY",
  "ASST_GEN_SECRETARY",
  "SPEAKER",
  "TECHNICAL_DIRECTOR",
  "SUPER_ADMIN",
];

export const REWARD_CATEGORY_LABELS: Record<string, string> = {
  MOST_CONSISTENT: "Most Consistent Member",
  ATTENDANCE_CHAMPION: "Attendance Champion",
  TOP_INNOVATOR: "Top Innovator",
  COMMUNITY_CONTRIBUTOR: "Community Contributor",
  WORKSHOP_CHAMPION: "Workshop Champion",
  OUTSTANDING_FRESHER: "Outstanding Fresher",
  BEST_FEMALE_TECH: "Best Female Tech Participant",
  EMERGING_LEADER: "Emerging Leader",
};

export const CERTIFICATE_CATEGORY_LABELS: Record<string, string> = {
  ACTIVE_PARTICIPATION: "Active Participation",
  ATTENDANCE_EXCELLENCE: "Attendance Excellence",
  LEADERSHIP_SERVICE: "Leadership Service",
  COMMUNITY_CONTRIBUTION: "Community Contribution",
  INNOVATION_EXCELLENCE: "Innovation Excellence",
};

export const COURSES = [
  "Computer Science",
  "Information Technology",
  "Software Engineering",
  "Data Science",
  "Computer Engineering",
] as const;

export const YEAR_GROUPS = [1, 2, 3, 4] as const;
