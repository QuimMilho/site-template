export interface GuildInfo {
    id: string;
    icon: string;
    banner: string | undefined;
    memberCount: number;
    owner: MemberMention;
    premiumSubsCount: number;
    premiumTier: number;
    name: string;
    vanityURLCode: string;
    vanityURLUses: number;
    verified: boolean;
}

export interface GuildMentionsInfo {
    id: string;
    members: MemberMention[];
    roles: RoleMention[];
    channels: ChannelMention[];
}

export interface MessageInfo {
    id: string;
    attachments: any[];
    embeds: CustomEmbed[];
    content: string;
}

export interface CustomEmbed {
    author?: { name: string; icon?: string; url?: string };
    hexColor: string;
    description?: string;
    fields?: { inline?: boolean; name: string; value: string }[];
    footer?: { text: string; iconURL?: string };
    image?: { url: string; height: number; width: number };
    thumbnail?: { url: string; height: number; width: number };
    timestamp?: string | number;
    title?: string;
    url?: string;
}

export interface MemberMention {
    id: string;
    displayName: string;
    username: string;
    discriminator: string;
}

export interface ChannelMention {
    parent: ChannelMention | undefined;
    id: string;
    name: string;
    type: string;
}

export interface RoleMention {
    id: string;
    hexColor: string;
    name: string;
}

export interface APIGuildInfo {
    id: string;
    name: string;
    members: number;
}

//Guild config

export interface GuildConfiguration {
    moderation: GuildModerationConfig;
}

export interface GuildModerationConfig {
    active: boolean;
    automod: AutoModOptions;
    warns: WarningsOptions;
    punitionsOnServer: boolean;
    mutedRoles: string[];
    banRoles: boolean;
    bannedRoles: string[];
    moderators: string[];
    logs: string[];
}

export interface AutoModOptions {
    massEmoji: number;
    massMention: number;
    discordInvites: boolean;
    links: boolean;
    duplicatedMessages: boolean;
    autoDeleteMessages: string[];
}

export interface WarningsOptions {
    maxWarnings: number;
    muteTime: number;
    warnExpires: number;
}