import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Trash2, X, Upload, FileText, Sparkles, Loader2 } from 'lucide-react';
import { ENTITY_TYPES } from './EntityLibrary';
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import MultiEntryField from './MultiEntryField';
import LabelCombobox from './LabelCombobox';


const PERSON_ATTRIBUTE_CATEGORIES = {
  'core': {
    label: 'Core Identifiers',
    fields: [
      { key: 'Legal Name', type: 'text', placeholder: 'e.g., John Michael Smith' },
      { key: 'Date of Birth', type: 'text', placeholder: 'DD/MM/YYYY' },
      { 
        key: 'Aliases/AKAs', 
        type: 'multi',
        subFields: [
          { key: 'alias', label: 'Alias/Nickname', type: 'text', placeholder: 'e.g., Johnny, JMS' },
          { key: 'context', label: 'Context/Usage', type: 'text', placeholder: 'Where used' }
        ]
      },
      { 
        key: 'Place of Birth', 
        type: 'multi',
        subFields: [
          { key: 'city', label: 'City', type: 'text', placeholder: 'e.g., New York' },
          { key: 'country', label: 'Country', type: 'text', placeholder: 'e.g., USA' }
        ]
      },
      { 
        key: 'Nationalities', 
        type: 'multi',
        subFields: [
          { key: 'country', label: 'Country', type: 'text', placeholder: 'e.g., USA' },
          { key: 'acquired', label: 'Acquired Date', type: 'text', placeholder: 'MM/YYYY' },
          { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Renounced', 'Dual Citizen'] }
        ]
      },
      { 
        key: 'Passports', 
        type: 'multi',
        subFields: [
          { key: 'number', label: 'Passport Number', type: 'text', placeholder: 'e.g., X1234567' },
          { key: 'country', label: 'Issuing Country', type: 'text', placeholder: 'e.g., USA' },
          { key: 'issued', label: 'Issue Date', type: 'text', placeholder: 'DD/MM/YYYY' },
          { key: 'expires', label: 'Expiry Date', type: 'text', placeholder: 'DD/MM/YYYY' },
          { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Expired', 'Revoked', 'Lost'] }
        ]
      },
      { 
        key: 'National IDs', 
        type: 'multi',
        subFields: [
          { key: 'type', label: 'ID Type', type: 'text', placeholder: 'e.g., SSN, National ID' },
          { key: 'number', label: 'ID Number', type: 'text', placeholder: 'Last 4 or full' },
          { key: 'country', label: 'Issuing Country', type: 'text', placeholder: 'e.g., USA' },
          { key: 'issued', label: 'Issue Date', type: 'text', placeholder: 'DD/MM/YYYY' }
        ]
      },
      { 
        key: 'Physical Descriptions', 
        type: 'multi',
        subFields: [
          { key: 'height', label: 'Height', type: 'text', placeholder: 'e.g., 6\'2"' },
          { key: 'weight', label: 'Weight', type: 'text', placeholder: 'e.g., 180 lbs' },
          { key: 'eyes', label: 'Eye Color', type: 'text', placeholder: 'e.g., Brown' },
          { key: 'hair', label: 'Hair Color', type: 'text', placeholder: 'e.g., Black' },
          { key: 'marks', label: 'Distinguishing Marks', type: 'text', placeholder: 'Scars, tattoos, etc.' }
        ]
      },
      { 
        key: 'Biometrics', 
        type: 'multi',
        subFields: [
          { key: 'type', label: 'Biometric Type', type: 'select', options: ['Fingerprint', 'Facial Recognition', 'DNA', 'Iris Scan', 'Voice Print'] },
          { key: 'data', label: 'Data/Reference', type: 'text', placeholder: 'ID or reference number' },
          { key: 'source', label: 'Source/Database', type: 'text', placeholder: 'Where obtained' }
        ]
      }
    ]
  },
  'contact': {
    label: 'Contact & Location',
    fields: [
      { 
        key: 'Addresses', 
        type: 'multi',
        subFields: [
          { key: 'type', label: 'Address Type', type: 'select', options: ['Current', 'Previous', 'Work', 'Secondary', 'Safe House'] },
          { key: 'street', label: 'Street Address', type: 'text', placeholder: 'Full street address' },
          { key: 'city', label: 'City', type: 'text', placeholder: 'City' },
          { key: 'state', label: 'State/Province', type: 'text', placeholder: 'State' },
          { key: 'country', label: 'Country', type: 'text', placeholder: 'Country' },
          { key: 'dates', label: 'Dates of Residence', type: 'text', placeholder: 'From - To' }
        ]
      },
      { 
        key: 'Phone Numbers', 
        type: 'multi',
        subFields: [
          { key: 'number', label: 'Phone Number', type: 'text', placeholder: '+1 555-1234' },
          { key: 'type', label: 'Type', type: 'select', options: ['Mobile', 'Landline', 'VoIP', 'Burner', 'Work'] },
          { key: 'carrier', label: 'Carrier', type: 'text', placeholder: 'e.g., Verizon' },
          { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive', 'Disconnected'] }
        ]
      },
      { 
        key: 'Email Addresses', 
        type: 'multi',
        subFields: [
          { key: 'email', label: 'Email Address', type: 'text', placeholder: 'user@example.com' },
          { key: 'type', label: 'Type', type: 'select', options: ['Personal', 'Work', 'Throwaway', 'Anonymous'] },
          { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive', 'Compromised'] }
        ]
      },
      { 
        key: 'Social Media', 
        type: 'multi',
        subFields: [
          { key: 'platform', label: 'Platform', type: 'text', placeholder: 'e.g., Twitter, Instagram' },
          { key: 'handle', label: 'Username/Handle', type: 'text', placeholder: '@username' },
          { key: 'url', label: 'Profile URL', type: 'text', placeholder: 'Full URL' },
          { key: 'activity', label: 'Activity Level', type: 'select', options: ['High', 'Medium', 'Low', 'Inactive'] }
        ]
      },
      { 
        key: 'IP Addresses', 
        type: 'multi',
        subFields: [
          { key: 'ip', label: 'IP Address', type: 'text', placeholder: '192.168.1.1' },
          { key: 'type', label: 'Type', type: 'select', options: ['Home', 'Work', 'VPN', 'Proxy', 'Mobile'] },
          { key: 'location', label: 'Geographic Location', type: 'text', placeholder: 'City, Country' },
          { key: 'lastSeen', label: 'Last Seen', type: 'text', placeholder: 'DD/MM/YYYY' }
        ]
      },
      { 
        key: 'Vehicles', 
        type: 'multi',
        subFields: [
          { key: 'make', label: 'Make/Model', type: 'text', placeholder: 'e.g., Toyota Camry' },
          { key: 'year', label: 'Year', type: 'text', placeholder: 'e.g., 2020' },
          { key: 'registration', label: 'Registration/Plate', type: 'text', placeholder: 'License plate' },
          { key: 'vin', label: 'VIN', type: 'text', placeholder: 'Vehicle ID number' },
          { key: 'color', label: 'Color', type: 'text', placeholder: 'e.g., Silver' }
        ]
      },
      { 
        key: 'Frequent Locations', 
        type: 'multi',
        subFields: [
          { key: 'name', label: 'Location Name', type: 'text', placeholder: 'e.g., Coffee shop, gym' },
          { key: 'address', label: 'Address', type: 'text', placeholder: 'Full address' },
          { key: 'frequency', label: 'Frequency', type: 'select', options: ['Daily', 'Weekly', 'Monthly', 'Occasional'] },
          { key: 'times', label: 'Typical Times', type: 'text', placeholder: 'e.g., Mon-Fri 8am' }
        ]
      }
    ]
  },
  'family': {
    label: 'Family & Associates',
    fields: [
      { 
        key: 'Family Members', 
        type: 'multi',
        subFields: [
          { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Name' },
          { key: 'relationship', label: 'Relationship', type: 'select', options: ['Parent', 'Sibling', 'Spouse', 'Child', 'Ex-Spouse', 'Partner', 'Other'] },
          { key: 'dob', label: 'Date of Birth', type: 'text', placeholder: 'DD/MM/YYYY' },
          { key: 'location', label: 'Current Location', type: 'text', placeholder: 'City, Country' },
          { key: 'contact', label: 'Contact Info', type: 'text', placeholder: 'Phone/Email' }
        ]
      },
      { 
        key: 'Associates', 
        type: 'multi',
        subFields: [
          { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Name' },
          { key: 'relationship', label: 'Relationship Type', type: 'text', placeholder: 'e.g., Business partner, friend' },
          { key: 'strength', label: 'Connection Strength', type: 'select', options: ['Inner Circle', 'Close', 'Regular', 'Distant'] },
          { key: 'since', label: 'Known Since', type: 'text', placeholder: 'MM/YYYY' },
          { key: 'context', label: 'How Connected', type: 'text', placeholder: 'e.g., Met at work' }
        ]
      }
    ]
  },
  'education': {
    label: 'Education & Professional',
    fields: [
      { 
        key: 'Education', 
        type: 'multi',
        subFields: [
          { key: 'institution', label: 'Institution', type: 'text', placeholder: 'School/University name' },
          { key: 'degree', label: 'Degree/Diploma', type: 'text', placeholder: 'e.g., BS Computer Science' },
          { key: 'years', label: 'Years Attended', type: 'text', placeholder: 'e.g., 2010-2014' },
          { key: 'gpa', label: 'GPA (if known)', type: 'text', placeholder: 'e.g., 3.5' },
          { key: 'location', label: 'Location', type: 'text', placeholder: 'City, Country' }
        ]
      },
      { 
        key: 'Employment', 
        type: 'multi',
        subFields: [
          { key: 'company', label: 'Company/Organization', type: 'text', placeholder: 'Employer name' },
          { key: 'position', label: 'Position/Title', type: 'text', placeholder: 'Job title' },
          { key: 'dates', label: 'Employment Dates', type: 'text', placeholder: 'From - To' },
          { key: 'salary', label: 'Salary Range', type: 'text', placeholder: 'e.g., $80k-$100k' },
          { key: 'location', label: 'Location', type: 'text', placeholder: 'City, Country' }
        ]
      },
      { 
        key: 'Former Employment', 
        type: 'multi',
        subFields: [
          { key: 'company', label: 'Company/Organization', type: 'text', placeholder: 'Former employer name' },
          { key: 'position', label: 'Position/Title', type: 'text', placeholder: 'Job title' },
          { key: 'dates', label: 'Employment Dates', type: 'text', placeholder: 'From - To' },
          { key: 'reason', label: 'Reason for Leaving', type: 'text', placeholder: 'e.g., Resigned, Terminated' },
          { key: 'location', label: 'Location', type: 'text', placeholder: 'City, Country' }
        ]
      },
      { 
        key: 'Professional Licenses', 
        type: 'multi',
        subFields: [
          { key: 'type', label: 'License Type', type: 'text', placeholder: 'e.g., Medical, Legal, Pilot' },
          { key: 'number', label: 'License Number', type: 'text', placeholder: 'License ID' },
          { key: 'issued', label: 'Issue Date', type: 'text', placeholder: 'MM/YYYY' },
          { key: 'expires', label: 'Expiry Date', type: 'text', placeholder: 'MM/YYYY' },
          { key: 'issuer', label: 'Issuing Authority', type: 'text', placeholder: 'Organization/Country' }
        ]
      },
      { 
        key: 'Military Service', 
        type: 'multi',
        subFields: [
          { key: 'branch', label: 'Branch', type: 'text', placeholder: 'e.g., Army, Navy' },
          { key: 'rank', label: 'Rank', type: 'text', placeholder: 'e.g., Captain' },
          { key: 'mos', label: 'MOS/Specialty', type: 'text', placeholder: 'Military specialty' },
          { key: 'dates', label: 'Service Dates', type: 'text', placeholder: 'From - To' },
          { key: 'deployments', label: 'Deployments', type: 'text', placeholder: 'Locations served' },
          { key: 'clearance', label: 'Security Clearance', type: 'select', options: ['None', 'Confidential', 'Secret', 'Top Secret', 'TS/SCI'] }
        ]
      },
      { 
        key: 'Security Clearances', 
        type: 'multi',
        subFields: [
          { key: 'level', label: 'Clearance Level', type: 'select', options: ['Confidential', 'Secret', 'Top Secret', 'TS/SCI', 'Q Clearance'] },
          { key: 'granted', label: 'Granted Date', type: 'text', placeholder: 'MM/YYYY' },
          { key: 'expires', label: 'Expiry Date', type: 'text', placeholder: 'MM/YYYY' },
          { key: 'issuer', label: 'Issuing Agency', type: 'text', placeholder: 'e.g., DoD' },
          { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Expired', 'Revoked', 'Suspended'] }
        ]
      }
    ]
  },
  'financial': {
    label: 'Financial Profile',
    fields: [
      { 
        key: 'Bank Accounts', 
        type: 'multi',
        subFields: [
          { key: 'institution', label: 'Institution', type: 'text', placeholder: 'e.g., Chase Bank' },
          { key: 'country', label: 'Country', type: 'text', placeholder: 'e.g., USA' },
          { key: 'accountNumber', label: 'Account Number', type: 'text', placeholder: 'Last 4 digits' },
          { key: 'accountType', label: 'Account Type', type: 'select', options: ['Checking', 'Savings', 'Business', 'Offshore'] },
          { key: 'balance', label: 'Approx. Balance', type: 'text', placeholder: 'e.g., $50,000' },
          { key: 'opened', label: 'Opened Date', type: 'text', placeholder: 'MM/YYYY' }
        ]
      },
      { 
        key: 'Credit Cards', 
        type: 'multi',
        subFields: [
          { key: 'issuer', label: 'Issuer', type: 'text', placeholder: 'e.g., Visa, Mastercard' },
          { key: 'last4', label: 'Last 4 Digits', type: 'text', placeholder: '1234' },
          { key: 'limit', label: 'Credit Limit', type: 'text', placeholder: 'e.g., $10,000' },
          { key: 'expires', label: 'Expiry Date', type: 'text', placeholder: 'MM/YY' }
        ]
      },
      { 
        key: 'Crypto Wallets', 
        type: 'multi',
        subFields: [
          { key: 'currency', label: 'Currency', type: 'text', placeholder: 'e.g., Bitcoin, Ethereum' },
          { key: 'address', label: 'Wallet Address', type: 'text', placeholder: 'Public key' },
          { key: 'balance', label: 'Approx. Balance', type: 'text', placeholder: 'e.g., 0.5 BTC' },
          { key: 'exchange', label: 'Exchange/Platform', type: 'text', placeholder: 'e.g., Coinbase' }
        ]
      },
      { key: 'Income Sources', type: 'text' },
      { key: 'Net Worth Estimate', type: 'text' },
      { 
        key: 'Major Assets', 
        type: 'multi',
        subFields: [
          { key: 'assetType', label: 'Asset Type', type: 'select', options: ['Real Estate', 'Vehicle', 'Aircraft', 'Yacht', 'Investment', 'Business', 'Other'] },
          { key: 'description', label: 'Description', type: 'text', placeholder: 'e.g., 3BR house in Manhattan' },
          { key: 'location', label: 'Location', type: 'text', placeholder: 'Address or region' },
          { key: 'value', label: 'Estimated Value', type: 'text', placeholder: 'e.g., $500,000' },
          { key: 'acquired', label: 'Acquired Date', type: 'text', placeholder: 'MM/YYYY' }
        ]
      },
      { key: 'Debts/Liabilities', type: 'text' },
      { key: 'Credit Score', type: 'text' }
    ]
  },
  'digital': {
    label: 'Digital Footprint',
    fields: [
      { 
        key: 'Social Media Accounts', 
        type: 'multi',
        subFields: [
          { key: 'platform', label: 'Platform', type: 'text', placeholder: 'e.g., Facebook, LinkedIn' },
          { key: 'username', label: 'Username', type: 'text', placeholder: 'Username/handle' },
          { key: 'url', label: 'Profile URL', type: 'text', placeholder: 'Full URL' },
          { key: 'activity', label: 'Activity Level', type: 'select', options: ['High', 'Medium', 'Low', 'Inactive'] },
          { key: 'lastPost', label: 'Last Post Date', type: 'text', placeholder: 'DD/MM/YYYY' }
        ]
      },
      { 
        key: 'Dating App Profiles', 
        type: 'multi',
        subFields: [
          { key: 'app', label: 'App Name', type: 'text', placeholder: 'e.g., Tinder, Bumble' },
          { key: 'username', label: 'Username', type: 'text', placeholder: 'Profile name' },
          { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive', 'Deleted'] }
        ]
      },
      { 
        key: 'Forums & Communities', 
        type: 'multi',
        subFields: [
          { key: 'site', label: 'Forum/Site', type: 'text', placeholder: 'Forum name' },
          { key: 'username', label: 'Username', type: 'text', placeholder: 'Handle' },
          { key: 'joined', label: 'Join Date', type: 'text', placeholder: 'MM/YYYY' },
          { key: 'activity', label: 'Post Count/Activity', type: 'text', placeholder: 'e.g., 500 posts' }
        ]
      },
      { 
        key: 'Dark Web Presence', 
        type: 'multi',
        subFields: [
          { key: 'marketplace', label: 'Marketplace/Forum', type: 'text', placeholder: 'Site name' },
          { key: 'username', label: 'Username', type: 'text', placeholder: 'Handle' },
          { key: 'activity', label: 'Activity Type', type: 'text', placeholder: 'e.g., Buyer, seller, vendor' },
          { key: 'reputation', label: 'Reputation Score', type: 'text', placeholder: 'If applicable' }
        ]
      },
      { 
        key: 'Messaging Apps', 
        type: 'multi',
        subFields: [
          { key: 'app', label: 'App Name', type: 'select', options: ['WhatsApp', 'Telegram', 'Signal', 'Wickr', 'Discord', 'Other'] },
          { key: 'identifier', label: 'Username/Number', type: 'text', placeholder: 'Phone or username' },
          { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] }
        ]
      },
      { 
        key: 'Cloud Storage', 
        type: 'multi',
        subFields: [
          { key: 'service', label: 'Service', type: 'select', options: ['Google Drive', 'Dropbox', 'iCloud', 'OneDrive', 'Other'] },
          { key: 'email', label: 'Associated Email', type: 'text', placeholder: 'Login email' },
          { key: 'capacity', label: 'Storage Capacity', type: 'text', placeholder: 'e.g., 100GB' }
        ]
      },
      { 
        key: 'Data Breaches', 
        type: 'multi',
        subFields: [
          { key: 'breach', label: 'Breach Name', type: 'text', placeholder: 'e.g., LinkedIn 2012' },
          { key: 'date', label: 'Breach Date', type: 'text', placeholder: 'MM/YYYY' },
          { key: 'exposed', label: 'Data Exposed', type: 'text', placeholder: 'e.g., Email, password hash' },
          { key: 'source', label: 'Source', type: 'text', placeholder: 'e.g., HaveIBeenPwned' }
        ]
      }
    ]
  },
  'criminal': {
    label: 'Criminal & Legal',
    fields: [
      { 
        key: 'Criminal Records', 
        type: 'multi',
        subFields: [
          { key: 'type', label: 'Record Type', type: 'select', options: ['Arrest', 'Conviction', 'Charge', 'Acquittal'] },
          { key: 'offense', label: 'Offense', type: 'text', placeholder: 'Description of charge' },
          { key: 'date', label: 'Date', type: 'text', placeholder: 'DD/MM/YYYY' },
          { key: 'jurisdiction', label: 'Jurisdiction', type: 'text', placeholder: 'City, State, Country' },
          { key: 'outcome', label: 'Outcome', type: 'text', placeholder: 'Sentence, verdict, etc.' },
          { key: 'caseNumber', label: 'Case Number', type: 'text', placeholder: 'Court case ID' }
        ]
      },
      { 
        key: 'Civil Lawsuits', 
        type: 'multi',
        subFields: [
          { key: 'role', label: 'Role', type: 'select', options: ['Plaintiff', 'Defendant'] },
          { key: 'type', label: 'Lawsuit Type', type: 'text', placeholder: 'e.g., Contract dispute' },
          { key: 'date', label: 'Filed Date', type: 'text', placeholder: 'DD/MM/YYYY' },
          { key: 'court', label: 'Court', type: 'text', placeholder: 'Court name' },
          { key: 'status', label: 'Status', type: 'select', options: ['Pending', 'Settled', 'Dismissed', 'Judgment'] },
          { key: 'outcome', label: 'Outcome', type: 'text', placeholder: 'Result if concluded' }
        ]
      },
      { 
        key: 'Restraining Orders', 
        type: 'multi',
        subFields: [
          { key: 'type', label: 'Order Type', type: 'select', options: ['Against Subject', 'Obtained by Subject'] },
          { key: 'party', label: 'Other Party', type: 'text', placeholder: 'Name of other person' },
          { key: 'issued', label: 'Issue Date', type: 'text', placeholder: 'DD/MM/YYYY' },
          { key: 'expires', label: 'Expiry Date', type: 'text', placeholder: 'DD/MM/YYYY' },
          { key: 'court', label: 'Issuing Court', type: 'text', placeholder: 'Court name' }
        ]
      },
      { 
        key: 'Warrants', 
        type: 'multi',
        subFields: [
          { key: 'type', label: 'Warrant Type', type: 'select', options: ['Arrest', 'Bench', 'Search', 'Extradition'] },
          { key: 'issued', label: 'Issue Date', type: 'text', placeholder: 'DD/MM/YYYY' },
          { key: 'jurisdiction', label: 'Jurisdiction', type: 'text', placeholder: 'Issuing authority' },
          { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Executed', 'Recalled', 'Expired'] },
          { key: 'reason', label: 'Reason', type: 'text', placeholder: 'Reason for warrant' }
        ]
      },
      { 
        key: 'Gang Affiliations', 
        type: 'multi',
        subFields: [
          { key: 'organization', label: 'Organization/Gang', type: 'text', placeholder: 'Gang name' },
          { key: 'role', label: 'Role/Status', type: 'text', placeholder: 'e.g., Member, associate, leader' },
          { key: 'since', label: 'Affiliated Since', type: 'text', placeholder: 'MM/YYYY' },
          { key: 'verified', label: 'Verification', type: 'select', options: ['Confirmed', 'Suspected', 'Former'] }
        ]
      },
      { 
        key: 'Watchlists', 
        type: 'multi',
        subFields: [
          { key: 'list', label: 'Watchlist Name', type: 'text', placeholder: 'e.g., No Fly List, OFAC' },
          { key: 'added', label: 'Added Date', type: 'text', placeholder: 'DD/MM/YYYY' },
          { key: 'reason', label: 'Reason', type: 'text', placeholder: 'Why on list' },
          { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Removed', 'Under Review'] }
        ]
      }
    ]
  },
  'behavioral': {
    label: 'Behavioral & Psychological',
    fields: [
      { 
        key: 'Personality Traits', 
        type: 'multi',
        subFields: [
          { key: 'trait', label: 'Trait', type: 'text', placeholder: 'e.g., Narcissistic, impulsive' },
          { key: 'evidence', label: 'Evidence/Basis', type: 'text', placeholder: 'How observed' },
          { key: 'severity', label: 'Severity', type: 'select', options: ['Mild', 'Moderate', 'Severe'] }
        ]
      },
      { 
        key: 'Political Leanings', 
        type: 'multi',
        subFields: [
          { key: 'ideology', label: 'Ideology', type: 'text', placeholder: 'e.g., Conservative, liberal' },
          { key: 'strength', label: 'Conviction Strength', type: 'select', options: ['Weak', 'Moderate', 'Strong', 'Extremist'] },
          { key: 'evidence', label: 'Evidence', type: 'text', placeholder: 'Social media, affiliations' }
        ]
      },
      { 
        key: 'Religious Affiliation', 
        type: 'multi',
        subFields: [
          { key: 'religion', label: 'Religion', type: 'text', placeholder: 'Religious affiliation' },
          { key: 'observance', label: 'Level of Observance', type: 'select', options: ['Non-practicing', 'Casual', 'Regular', 'Devout', 'Extremist'] },
          { key: 'congregation', label: 'Congregation/Mosque/Church', type: 'text', placeholder: 'Where attends' }
        ]
      },
      { 
        key: 'Known Vices', 
        type: 'multi',
        subFields: [
          { key: 'vice', label: 'Vice Type', type: 'select', options: ['Gambling', 'Drugs', 'Alcohol', 'Sex Work', 'Other'] },
          { key: 'severity', label: 'Severity', type: 'select', options: ['Recreational', 'Regular', 'Addicted', 'In Recovery'] },
          { key: 'details', label: 'Details', type: 'text', placeholder: 'Additional information' }
        ]
      },
      { 
        key: 'Medical Conditions', 
        type: 'multi',
        subFields: [
          { key: 'condition', label: 'Condition', type: 'text', placeholder: 'Medical condition' },
          { key: 'severity', label: 'Severity', type: 'select', options: ['Minor', 'Moderate', 'Serious', 'Critical'] },
          { key: 'treatment', label: 'Treatment', type: 'text', placeholder: 'Medications, therapy' },
          { key: 'exploitable', label: 'Exploitable?', type: 'select', options: ['No', 'Possibly', 'Yes'] }
        ]
      },
      { 
        key: 'Phobias/Aversions', 
        type: 'multi',
        subFields: [
          { key: 'phobia', label: 'Phobia/Aversion', type: 'text', placeholder: 'e.g., Heights, spiders' },
          { key: 'severity', label: 'Severity', type: 'select', options: ['Mild', 'Moderate', 'Severe'] }
        ]
      },
      { 
        key: 'Daily Routines', 
        type: 'multi',
        subFields: [
          { key: 'activity', label: 'Activity', type: 'text', placeholder: 'e.g., Morning coffee, gym' },
          { key: 'schedule', label: 'Schedule', type: 'text', placeholder: 'e.g., Mon-Fri 8am' },
          { key: 'location', label: 'Location', type: 'text', placeholder: 'Where occurs' },
          { key: 'predictability', label: 'Predictability', type: 'select', options: ['Highly Predictable', 'Regular', 'Occasional', 'Sporadic'] }
        ]
      }
    ]
  },
  'vulnerabilities': {
    label: 'Vulnerabilities & Leverage',
    fields: [
      { 
        key: 'Financial Pressures', 
        type: 'multi',
        subFields: [
          { key: 'type', label: 'Pressure Type', type: 'select', options: ['Debt', 'Mortgage', 'Child Support', 'Business Loss', 'Gambling', 'Other'] },
          { key: 'amount', label: 'Amount (if known)', type: 'text', placeholder: 'e.g., $50,000' },
          { key: 'urgency', label: 'Urgency', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
          { key: 'exploitability', label: 'Exploitability', type: 'select', options: ['Low', 'Medium', 'High'] }
        ]
      },
      { 
        key: 'Compromising Material', 
        type: 'multi',
        subFields: [
          { key: 'type', label: 'Material Type', type: 'select', options: ['Photos/Video', 'Financial Records', 'Communications', 'Medical Records', 'Other'] },
          { key: 'description', label: 'Description', type: 'text', placeholder: 'Brief description' },
          { key: 'severity', label: 'Severity', type: 'select', options: ['Minor', 'Moderate', 'Serious', 'Devastating'] },
          { key: 'location', label: 'Location/Source', type: 'text', placeholder: 'Where material is' }
        ]
      },
      { 
        key: 'Exploitable Family', 
        type: 'multi',
        subFields: [
          { key: 'member', label: 'Family Member', type: 'text', placeholder: 'Name and relationship' },
          { key: 'vulnerability', label: 'Vulnerability', type: 'text', placeholder: 'Why exploitable' },
          { key: 'risk', label: 'Risk Level', type: 'select', options: ['Low', 'Medium', 'High'] }
        ]
      },
      { 
        key: 'Ego/Recognition Needs', 
        type: 'multi',
        subFields: [
          { key: 'need', label: 'Need Type', type: 'text', placeholder: 'e.g., Validation, status' },
          { key: 'strength', label: 'Strength', type: 'select', options: ['Mild', 'Moderate', 'Strong', 'Obsessive'] },
          { key: 'exploitability', label: 'Exploitability', type: 'select', options: ['Low', 'Medium', 'High'] }
        ]
      },
      { 
        key: 'Ideological Blind Spots', 
        type: 'multi',
        subFields: [
          { key: 'ideology', label: 'Ideology/Belief', type: 'text', placeholder: 'Strong belief' },
          { key: 'blindSpot', label: 'Blind Spot', type: 'text', placeholder: 'What they miss' },
          { key: 'exploitability', label: 'Exploitability', type: 'select', options: ['Low', 'Medium', 'High'] }
        ]
      }
    ]
  },
  'operational': {
    label: 'Operational/Intelligence',
    fields: [
      { key: 'Threat Level', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
      { key: 'Recruitment Potential', type: 'select', options: ['Low', 'Medium', 'High'] },
      { key: 'Source Reliability', type: 'select', options: ['Unreliable', 'Questionable', 'Reliable', 'Highly Reliable'] },
      { key: 'Surveillance Detection', type: 'select', options: ['Unaware', 'Low', 'Moderate', 'High', 'Expert'] },
      { 
        key: 'Travel History', 
        type: 'multi',
        subFields: [
          { key: 'destination', label: 'Destination', type: 'text', placeholder: 'Country/City' },
          { key: 'date', label: 'Travel Date', type: 'text', placeholder: 'DD/MM/YYYY' },
          { key: 'duration', label: 'Duration', type: 'text', placeholder: 'e.g., 5 days' },
          { key: 'purpose', label: 'Purpose', type: 'text', placeholder: 'Business, Personal, etc.' }
        ]
      },
      { 
        key: 'Border Crossings', 
        type: 'multi',
        subFields: [
          { key: 'date', label: 'Crossing Date', type: 'text', placeholder: 'DD/MM/YYYY' },
          { key: 'from', label: 'From Country', type: 'text', placeholder: 'Origin country' },
          { key: 'to', label: 'To Country', type: 'text', placeholder: 'Destination country' },
          { key: 'port', label: 'Port of Entry', type: 'text', placeholder: 'Airport/border crossing' },
          { key: 'reason', label: 'Reason', type: 'text', placeholder: 'Tourism, business, etc.' },
          { key: 'method', label: 'Method', type: 'select', options: ['Air', 'Land', 'Sea', 'Unknown'] }
        ]
      },
      { key: 'CI Concerns', type: 'text' }
    ]
  }
};

const ATTRIBUTE_TEMPLATES = {
  person: [],
  organization: [
    { key: 'Address', type: 'text' },
    { key: 'ACN', type: 'text' },
    { key: 'ABN', type: 'text' }
  ],
  location: [
    { key: 'Address', type: 'text' },
    { key: 'State', type: 'select', options: ['VIC', 'NSW', 'QLD', 'TAS', 'SA', 'WA', 'ACT', 'NT'] }
  ],
  event: [
    { key: 'Date', type: 'date' },
    { key: 'Location', type: 'text' }
  ],
  vehicle: [
    { key: 'Registration', type: 'text' },
    { key: 'VIN Number', type: 'text' },
    { key: 'Color', type: 'text' },
    { key: 'State Registered', type: 'select', options: ['VIC', 'NSW', 'QLD', 'TAS', 'SA', 'WA', 'ACT', 'NT'] }
  ],
  phone: [
    { key: 'Number', type: 'text' }
  ],
  email: [
    { key: 'Email Address', type: 'email' }
  ],
  document: [
    { key: 'Date', type: 'date' }
  ]
};

export default function PropertiesPanel({ entity, onUpdate, onDelete, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'person',
    description: '',
    color: '',
    attributes: {}
  });
  const [uploading, setUploading] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    if (entity) {
      const attrs = entity.attributes || {};
      // For person entities, extract first_name and surname from name if not already in attributes
      if (entity.type === 'person' && entity.name && !attrs.first_name && !attrs.surname) {
        const nameParts = entity.name.split(' ');
        attrs.first_name = nameParts[0] || '';
        attrs.surname = nameParts.slice(1).join(' ') || '';
      }
      setFormData({
        name: entity.name || '',
        type: entity.type || 'person',
        description: entity.description || '',
        color: entity.color || '',
        attributes: attrs
      });
      generateSummary(entity);
    } else {
      setAiSummary(null);
    }
  }, [entity]);

  const generateSummary = async (entityData) => {
    if (!entityData || !entityData.name) return;
    
    setSummaryLoading(true);
    try {
      const prompt = `Provide a concise, professional summary (2-3 sentences) for this ${entityData.type} entity:

Name: ${entityData.name}
Type: ${entityData.type}
Description: ${entityData.description || 'N/A'}
Attributes: ${JSON.stringify(entityData.attributes || {})}

Focus on the most important and relevant information. Be brief and factual.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" }
          }
        }
      });

      setAiSummary(result.summary);
    } catch (error) {
      console.error('Failed to generate summary:', error);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    
    // Validate name is not empty
    if (!formData.name || !formData.name.trim() || formData.name === 'Unnamed Person') {
      toast.error('Please enter at least a first name or surname');
      return;
    }
    
    onUpdate(formData);
  };

  const handleAttributeChange = (key, value) => {
    setFormData({
      ...formData,
      attributes: { ...formData.attributes, [key]: value }
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      const newAttributes = {
        ...formData.attributes,
        file_url: result.file_url,
        file_name: file.name
      };
      setFormData({
        ...formData,
        attributes: newAttributes
      });
      toast.success('Document uploaded - click Save to apply');
    } catch (error) {
      toast.error('Failed to upload document');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const config = ENTITY_TYPES[formData.type] || { color: '#64748b', label: 'Unknown' };
  const Icon = config?.icon || null;

  return (
    <div className="h-full flex flex-col border-l w-80 bg-[#11141A] border-[#2D3742]">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between border-[#2D3742]">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${config.color}15` }}
          >
            {Icon ? (
              <Icon className="w-5 h-5" style={{ color: config.color }} />
            ) : (
              <div className="w-5 h-5 rounded-sm" style={{ backgroundColor: config.color }} />
            )}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#E2E8F0]">
              {entity ? 'Entity Properties' : 'New Entity'}
            </h2>
            <p className="text-xs mt-0.5 text-[#94A3B8]">
              {config?.label}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Form */}
      <ScrollArea className="flex-1">
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Enriched Data */}
          {entity?.attributes?.enriched && (
            <Card className="p-3 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-700">
              <div className="flex items-start gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-semibold mb-1">Enriched Intelligence</h3>
                  <p className="text-xs text-slate-400">{entity.attributes.enriched.tagline}</p>
                </div>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Object.entries(entity.attributes.enriched.full).map(([key, value]) => (
                  <div key={key} className="text-xs">
                    <span className="text-slate-400">{key}:</span>{' '}
                    <span className="text-slate-100 font-medium">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-500">
                Enriched {new Date(entity.attributes.enriched_at).toLocaleDateString()}
              </div>
            </Card>
          )}

          {/* AI Summary (fallback for non-enriched) */}
          {entity && !entity.attributes?.enriched && (
            <Card className="p-3 bg-violet-50 border-violet-200">
              <div className="flex items-start gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-violet-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-semibold text-violet-900 mb-1">AI Summary</h3>
                  {summaryLoading ? (
                    <div className="flex items-center gap-2 text-xs text-violet-700">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Generating summary...
                    </div>
                  ) : aiSummary ? (
                    <p className="text-xs text-violet-800 leading-relaxed">{aiSummary}</p>
                  ) : (
                    <p className="text-xs text-violet-600 italic">No summary available</p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Basic Info */}
          <div className="space-y-3">
            {formData.type === 'phone' && (
              <div>
                <Label htmlFor="phone-number" className="text-xs font-medium text-slate-700">
                  Phone Number *
                </Label>
                <Input
                  id="phone-number"
                  type="tel"
                  value={formData.attributes?.['Number'] || ''}
                  onChange={(e) => {
                    const number = e.target.value;
                    setFormData({ 
                      ...formData, 
                      name: number,
                      attributes: { ...formData.attributes, 'Number': number }
                    });
                  }}
                  placeholder="04XX XXX XXX or (0X) XXXX XXXX"
                  className="mt-1.5 h-9"
                  required
                />
              </div>
            )}

            {formData.type === 'email' && (
              <div>
                <Label htmlFor="email-address" className="text-xs font-medium text-slate-700">
                  Email Address *
                </Label>
                <Input
                  id="email-address"
                  type="email"
                  value={formData.attributes?.['Email Address'] || ''}
                  onChange={(e) => {
                    const email = e.target.value;
                    setFormData({ 
                      ...formData, 
                      name: email,
                      attributes: { ...formData.attributes, 'Email Address': email }
                    });
                  }}
                  placeholder="user@example.com"
                  className="mt-1.5 h-9"
                  required
                />
              </div>
            )}

            {formData.type === 'person' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName" className="text-xs font-medium text-slate-700">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.attributes?.first_name || ''}
                    onChange={(e) => {
                      const firstName = e.target.value;
                      const surname = formData.attributes?.surname || '';
                      const fullName = `${firstName} ${surname}`.trim();
                      setFormData({ 
                        ...formData, 
                        name: fullName || 'Unnamed Person',
                        attributes: { ...formData.attributes, first_name: firstName }
                      });
                    }}
                    className="mt-1.5 h-9"
                  />
                </div>
                <div>
                  <Label htmlFor="surname" className="text-xs font-medium text-slate-700">
                    Surname *
                  </Label>
                  <Input
                    id="surname"
                    value={formData.attributes?.surname || ''}
                    onChange={(e) => {
                      const surname = e.target.value;
                      const firstName = formData.attributes?.first_name || '';
                      const fullName = `${firstName} ${surname}`.trim();
                      setFormData({ 
                        ...formData, 
                        name: fullName || 'Unnamed Person',
                        attributes: { ...formData.attributes, surname: surname }
                      });
                    }}
                    className="mt-1.5 h-9"
                  />
                </div>
              </div>
            )}

            {formData.type !== 'person' && formData.type !== 'email' && formData.type !== 'phone' && (
              <div>
                <Label htmlFor="name" className="text-xs font-medium text-slate-700">
                  {formData.type === 'organization' ? 'Business Name *' : 'Name *'}
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1.5 h-9"
                  required
                />
              </div>
            )}

            {(formData.type === 'person' || formData.type === 'organization') && (
              <div>
                <Label htmlFor="current-address" className="text-xs font-medium text-slate-700">
                  {formData.type === 'person' ? 'Current Address' : 'Address'}
                </Label>
                <Input
                  id="current-address"
                  value={formData.attributes?.current_address || ''}
                  onChange={(e) => handleAttributeChange('current_address', e.target.value)}
                  placeholder="Enter address"
                  className="mt-1.5 h-9"
                />
              </div>
            )}

            <div>
              <Label htmlFor="type" className="text-xs font-medium text-slate-700">
                Entity Type *
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="mt-1.5 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ENTITY_TYPES).map(([type, config]) => (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        {config.icon ? (
                          <config.icon className="w-4 h-4" style={{ color: config.color }} />
                        ) : (
                          <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: config.color }} />
                        )}
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description" className="text-xs font-medium text-slate-700">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1.5 h-20 text-sm resize-none"
                placeholder="Enter details..."
              />
            </div>

            <div>
              <Label htmlFor="color" className="text-xs font-medium text-slate-700">
                Node Color
              </Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  id="color"
                  type="color"
                  value={formData.color || config.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-16 h-9 p-1"
                />
                <Input
                  value={formData.color || config.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1 h-9 text-xs"
                  placeholder="#3b82f6"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="shape" className="text-xs font-medium text-slate-700">
                Node Shape
              </Label>
              <Select
                value={formData.attributes?.shape || ''}
                onValueChange={(value) => handleAttributeChange('shape', value === 'default' ? '' : value)}
              >
                <SelectTrigger className="mt-1.5 h-9">
                  <SelectValue placeholder="Default (based on type)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default (based on type)</SelectItem>
                  <SelectItem value="symbol_diamond">Diamond</SelectItem>
                  <SelectItem value="symbol_triangle">Triangle</SelectItem>
                  <SelectItem value="symbol_square">Square</SelectItem>
                  <SelectItem value="symbol_star">Star</SelectItem>
                  <SelectItem value="symbol_hexagon">Hexagon</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="label" className="text-xs font-medium text-slate-700">
                Custom Label (optional)
              </Label>
              <div className="mt-1.5">
                <LabelCombobox
                  value={formData.attributes?.custom_label || ''}
                  onChange={(value) => handleAttributeChange('custom_label', value)}
                  isRelationship={false}
                />
              </div>
            </div>
          </div>

          {/* Photo Upload for Person */}
          {formData.type === 'person' && (
            <div className="pt-4 border-t border-slate-200">
              <Label className="text-xs font-medium mb-2 block text-slate-700">
                Photo
              </Label>
              {formData.attributes.photo_url ? (
                <div className="space-y-2">
                  <div className="relative w-32 h-32 mx-auto">
                    <img 
                      src={formData.attributes.photo_url} 
                      alt="Person"
                      className="w-full h-full object-cover rounded-lg border-2 border-slate-200"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newAttributes = { ...formData.attributes };
                      delete newAttributes.photo_url;
                      setFormData({
                        ...formData,
                        attributes: newAttributes
                      });
                    }}
                    className="w-full text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove Photo
                  </Button>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    id="photo-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      setUploading(true);
                      try {
                        const result = await base44.integrations.Core.UploadFile({ file });
                        setFormData({
                          ...formData,
                          attributes: { ...formData.attributes, photo_url: result.file_url }
                        });
                        toast.success('Photo uploaded - click Save to apply');
                      } catch (error) {
                        toast.error('Failed to upload photo');
                      } finally {
                        setUploading(false);
                      }
                    }}
                    disabled={uploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('photo-upload').click()}
                    disabled={uploading}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Person Image'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Document Upload */}
          {formData.type === 'document' && (
            <div className="pt-4 border-t border-slate-200">
              <Label className="text-xs font-medium mb-2 block text-slate-700">
                Document File
              </Label>
              {formData.attributes.file_url ? (
                <div className="flex items-center gap-2 p-3 rounded-lg border bg-slate-50 border-slate-200">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span className="text-sm flex-1 truncate text-slate-700">
                    {formData.attributes.file_name || 'Document uploaded'}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newAttributes = { ...formData.attributes };
                      delete newAttributes.file_url;
                      delete newAttributes.file_name;
                      setFormData({
                        ...formData,
                        attributes: newAttributes
                      });
                    }}
                    className="h-7 text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('file-upload').click()}
                    disabled={uploading}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Document'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Custom Attributes */}
          <div className="pt-4 border-t border-slate-200">
            <Label className="text-xs font-medium mb-3 block text-slate-700">
              Additional Attributes
            </Label>

            {formData.type === 'person' ? (
              <Tabs defaultValue="core" className="w-full">
                <TabsList className="grid grid-cols-2 h-auto gap-1 bg-slate-100 p-1">
                  {Object.entries(PERSON_ATTRIBUTE_CATEGORIES).map(([key, category]) => (
                    <TabsTrigger 
                      key={key} 
                      value={key}
                      className="text-xs py-1.5 data-[state=active]:bg-white"
                    >
                      {category.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(PERSON_ATTRIBUTE_CATEGORIES).map(([key, category]) => (
                  <TabsContent key={key} value={key} className="mt-4 space-y-4">
                    {category.fields.map((attr) => (
                      <div key={attr.key}>
                        <Label className="text-xs font-semibold mb-2 block text-slate-700">
                          {attr.key}
                        </Label>
                        {attr.type === 'multi' ? (
                          <MultiEntryField
                            fieldKey={attr.key}
                            subFields={attr.subFields}
                            value={formData.attributes[attr.key] || []}
                            onChange={(value) => handleAttributeChange(attr.key, value)}
                          />
                        ) : attr.type === 'select' ? (
                          <Select
                            value={formData.attributes[attr.key] || ''}
                            onValueChange={(value) => handleAttributeChange(attr.key, value)}
                          >
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue placeholder={`Select ${attr.key}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {attr.options.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type={attr.type || 'text'}
                            value={formData.attributes[attr.key] || ''}
                            onChange={(e) => handleAttributeChange(attr.key, e.target.value)}
                            placeholder={attr.placeholder}
                            className="h-9 text-sm"
                          />
                        )}
                      </div>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="space-y-3">
                {ATTRIBUTE_TEMPLATES[formData.type]?.map((attr) => (
                  <div key={attr.key}>
                    <Label htmlFor={attr.key} className="text-xs text-slate-600">
                      {attr.key}
                    </Label>
                    {attr.type === 'select' ? (
                      <Select
                        value={formData.attributes[attr.key] || ''}
                        onValueChange={(value) => handleAttributeChange(attr.key, value)}
                      >
                        <SelectTrigger className="mt-1 h-9 text-sm">
                          <SelectValue placeholder={`Select ${attr.key}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {attr.options.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : attr.type === 'date' ? (
                      <Input
                        id={attr.key}
                        type="text"
                        placeholder="DD/MM/YYYY"
                        value={formData.attributes[attr.key] || ''}
                        onChange={(e) => handleAttributeChange(attr.key, e.target.value)}
                        className="mt-1 h-9 text-sm"
                      />
                    ) : (
                      <Input
                        id={attr.key}
                        type={attr.type}
                        value={formData.attributes[attr.key] || ''}
                        onChange={(e) => handleAttributeChange(attr.key, e.target.value)}
                        className="mt-1 h-9 text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
      </ScrollArea>

      {/* Actions */}
      <div className="p-4 border-t flex gap-2 border-slate-200">
        {entity && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        )}
        <Button
          type="button"
          onClick={handleSubmit}
          size="sm"
          className="flex-1 bg-slate-900 hover:bg-slate-800 text-white"
        >
          <Save className="w-4 h-4 mr-2" />
          {entity ? 'Update' : 'Create'}
        </Button>
      </div>
    </div>
  );
}