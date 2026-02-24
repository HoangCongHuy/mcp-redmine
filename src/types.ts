/**
 * Redmine API response types
 */

// --- Common ---

export interface RedmineListResponse<T> {
  items: T[];
  totalCount: number;
  offset: number;
  limit: number;
}

// --- Issues ---

export interface RedmineIssue {
  id: number;
  project: RedmineIdName;
  tracker: RedmineIdName;
  status: RedmineIdName;
  priority: RedmineIdName;
  author: RedmineIdName;
  assigned_to?: RedmineIdName;
  category?: RedmineIdName;
  fixed_version?: RedmineIdName;
  subject: string;
  description: string;
  start_date?: string;
  due_date?: string;
  done_ratio: number;
  is_private: boolean;
  estimated_hours?: number;
  spent_hours?: number;
  created_on: string;
  updated_on: string;
  closed_on?: string;
  journals?: RedmineJournal[];
  custom_fields?: RedmineCustomField[];
}

export interface RedmineJournal {
  id: number;
  user: RedmineIdName;
  notes: string;
  created_on: string;
  details: RedmineJournalDetail[];
}

export interface RedmineJournalDetail {
  property: string;
  name: string;
  old_value?: string;
  new_value?: string;
}

// --- Projects ---

export interface RedmineProject {
  id: number;
  name: string;
  identifier: string;
  description: string;
  status: number;
  is_public: boolean;
  homepage?: string;
  created_on: string;
  updated_on: string;
  parent?: RedmineIdName;
  trackers?: RedmineIdName[];
  issue_categories?: RedmineIdName[];
  enabled_modules?: { id: number; name: string }[];
  custom_fields?: RedmineCustomField[];
}

// --- Users ---

export interface RedmineUser {
  id: number;
  login: string;
  firstname: string;
  lastname: string;
  mail: string;
  created_on: string;
  updated_on?: string;
  last_login_on?: string;
  api_key?: string;
  status?: number;
  custom_fields?: RedmineCustomField[];
}

// --- Time Entries ---

export interface RedmineTimeEntry {
  id: number;
  project: RedmineIdName;
  issue?: RedmineIdName;
  user: RedmineIdName;
  activity: RedmineIdName;
  hours: number;
  comments: string;
  spent_on: string;
  created_on: string;
  updated_on: string;
  custom_fields?: RedmineCustomField[];
}

// --- Wiki ---

export interface RedmineWikiPage {
  title: string;
  text?: string;
  version?: number;
  author?: RedmineIdName;
  comments?: string;
  created_on?: string;
  updated_on?: string;
}

export interface RedmineWikiPageIndex {
  title: string;
  version?: number;
  created_on?: string;
  updated_on?: string;
}

// --- Shared ---

export interface RedmineIdName {
  id: number;
  name: string;
}

export interface RedmineCustomField {
  id: number;
  name: string;
  value: string | string[];
}

// --- Config ---

export interface RedmineConfig {
  url: string;
  apiKey?: string;
  username?: string;
  password?: string;
}

// --- Search ---

export interface RedmineSearchResult {
  id: number;
  title: string;
  type: string;
  url: string;
  description: string;
  datetime: string;
}
