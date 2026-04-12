/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  LayoutDashboard, 
  PieChart as PieChartIcon, 
  History, 
  Plus, 
  Minus,
  ArrowUpRight, 
  ArrowDownLeft, 
  ShoppingBag, 
  Home as HomeIcon, 
  Utensils, 
  Plane, 
  Bus, 
  HeartPulse, 
  Dumbbell, 
  Briefcase,
  Store,
  Gift,
  TrendingUp,
  Search, 
  ShoppingCart,
  Menu, 
  ChevronRight,
  Calendar,
  User as UserIcon,
  Settings,
  Camera,
  X,
  Check,
  Mail,
  Phone,
  FileSpreadsheet,
  RefreshCw,
  Trash2,
  Wallet,
  CreditCard,
  HandCoins,
  Receipt,
  ShieldCheck,
  Landmark,
  Wrench,
  Coins,
  Stethoscope,
  Hospital,
  Syringe,
  GraduationCap,
  Microscope,
  Activity,
  Coffee,
  Smartphone,
  Wifi,
  Tv,
  Gamepad2,
  Watch,
  Gem,
  Palmtree,
  Bed,
  Scissors,
  Shirt,
  Baby,
  Dog,
  Music,
  Ticket,
  PiggyBank,
  Scale,
  Gavel,
  Building2,
  Factory,
  Sprout,
  Wheat,
  Youtube,
  Handshake,
  Award,
  Heart,
  Car,
  Zap,
  Droplets,
  Flame,
  BookOpen,
  Laptop,
  Glasses,
  Cloud,
  Globe,
  Bitcoin,
  Languages,
  Construction,
  Hammer,
  HardHat,
  Truck,
  Ship,
  BaggageClaim,
  Library,
  School,
  University,
  Medal,
  Trophy,
  Target,
  Rocket,
  ZapOff,
  Lightbulb,
  Mic2,
  Radio,
  Speaker,
  Headphones,
  Tractor,
  Fish,
  Leaf,
  Wind,
  Thermometer,
  Axe,
  Pickaxe,
  Shovel,
  Milk,
  Egg,
  Book,
  Download,
  Users,
  GlassWater,
  Film,
  Sparkles,
  Footprints,
  Sofa,
  Smile,
  Eye,
  Pill,
  PenTool,
  Calculator,
  AlertCircle,
  Package,
  Printer,
  Paperclip,
  Megaphone,
  FileText,
  AlertTriangle,
  Dice5,
  CloudSnow,
  Bike,
  Bell
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Budget {
  category: string;
  amount: number;
}

const getCurrentMonthYear = () => {
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[now.getMonth()]} ${now.getFullYear()}`;
};

const getFormattedDate = (day: number, monthOffset: number = 0) => {
  const now = new Date();
  now.setMonth(now.getMonth() + monthOffset);
  const d = String(day).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  return `${d}-${m}-${y}, 10:00`;
};

// --- Mock Data ---
const INITIAL_CASH_FLOW_DATA = [];

const CATEGORY_DATA = [];

const INCOME_CATEGORIES = [
  // --- DOCTOR (WIFE) INCOME ---
  { name: 'Hospital Salary (Wife)', color: '#10B981', icon: <Hospital size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Private Chamber (Wife)', color: '#3B82F6', icon: <Stethoscope size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Consultation Fees (Wife)', color: '#8B5CF6', icon: <UserIcon size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Surgery/Procedures (Wife)', color: '#EF4444', icon: <Syringe size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'ER Duty Pay (Wife)', color: '#EF4444', icon: <Activity size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Medical Teaching (Wife)', color: '#F59E0B', icon: <GraduationCap size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Telemedicine (Wife)', color: '#3B82F6', icon: <Phone size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  
  // --- PRIVATE COMPANY (USER) INCOME ---
  { name: 'Corporate Salary', color: '#10B981', icon: <Briefcase size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Performance Bonus', color: '#F59E0B', icon: <Medal size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Festival Bonus', color: '#10B981', icon: <Gift size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'LFA (Leave Fare)', color: '#3B82F6', icon: <Plane size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'PF Withdrawal', color: '#8B5CF6', icon: <PiggyBank size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Gratuity', color: '#10B981', icon: <Handshake size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Profit Share', color: '#F59E0B', icon: <TrendingUp size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Overtime Pay', color: '#10B981', icon: <Activity size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  
  // --- COW FARM INCOME ---
  { name: 'Annual Cow Sale (Qurbani)', color: '#F59E0B', icon: <Coins size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Milk Sale (Daily)', color: '#3B82F6', icon: <Milk size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Calf Sale', color: '#10B981', icon: <Plus size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Dung/Fertilizer Sale', color: '#10B981', icon: <Sprout size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Breeding Services', color: '#8B5CF6', icon: <Activity size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  
  // --- AGRO INCOME ---
  { name: 'Rice/Paddy Sale', color: '#F59E0B', icon: <Wheat size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Vegetable Sale', color: '#10B981', icon: <Sprout size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Fruit Sale', color: '#F59E0B', icon: <Palmtree size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Fish Sale', color: '#3B82F6', icon: <Fish size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  
  // --- FINANCIAL & INVESTMENTS ---
  { name: 'Bank Interest', color: '#3B82F6', icon: <Landmark size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Bank Savings (Withdrawal)', color: '#3B82F6', icon: <Wallet size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'FDR Interest', color: '#3B82F6', icon: <Landmark size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Stock Dividends', color: '#10B981', icon: <TrendingUp size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Rent (Residential)', color: '#F59E0B', icon: <HomeIcon size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Rent (Commercial)', color: '#8B5CF6', icon: <Building2 size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Gold Sale', color: '#F59E0B', icon: <Gem size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Crypto Earnings', color: '#F59E0B', icon: <Bitcoin size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  
  // --- OTHER INCOME ---
  { name: 'Remittance', color: '#EC4899', icon: <Plane size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Gifts Received', color: '#EC4899', icon: <Gift size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Inheritance', color: '#6B7280', icon: <Landmark size={18} />, bg: 'bg-gray-100', text: 'text-gray-600' },
  { name: 'Prize Bond Win', color: '#F59E0B', icon: <Trophy size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Tax Refund', color: '#10B981', icon: <Receipt size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Loan Taken', color: '#EF4444', icon: <Landmark size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Debt Collection', color: '#10B981', icon: <HandCoins size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Freelancing', color: '#3B82F6', icon: <Laptop size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'YouTube/Social Media', color: '#EF4444', icon: <Youtube size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  
  // --- LIFETIME & FUTURE INCOME ---
  { name: 'Pension/Social Security', color: '#10B981', icon: <Landmark size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Commission/Brokerage', color: '#F59E0B', icon: <Handshake size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Royalty (Books/Art)', color: '#8B5CF6', icon: <Book size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Scrap/Waste Sale', color: '#6B7280', icon: <Trash2 size={18} />, bg: 'bg-gray-100', text: 'text-gray-600' },
  { name: 'Cashback/Rewards', color: '#10B981', icon: <Coins size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Daily Micro-Earnings', color: '#10B981', icon: <Plus size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Rental (Tools/Equip)', color: '#6B7280', icon: <Wrench size={18} />, bg: 'bg-gray-100', text: 'text-gray-600' },
  
  // --- NEW INCOME CATEGORIES ---
  { name: 'Children Allowance', color: '#3B82F6', icon: <Baby size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Side Hustle', color: '#10B981', icon: <Briefcase size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Consulting', color: '#8B5CF6', icon: <UserIcon size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Dividends', color: '#F59E0B', icon: <TrendingUp size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Capital Gains', color: '#10B981', icon: <TrendingUp size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Alimony', color: '#EC4899', icon: <Heart size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Child Support', color: '#3B82F6', icon: <Baby size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Grants', color: '#10B981', icon: <Gift size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Scholarships', color: '#8B5CF6', icon: <GraduationCap size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Lottery Winnings', color: '#F59E0B', icon: <Trophy size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Insurance Payout', color: '#3B82F6', icon: <ShieldCheck size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Reimbursements', color: '#10B981', icon: <Receipt size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Tips', color: '#F59E0B', icon: <Coins size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Affiliate Marketing', color: '#3B82F6', icon: <Laptop size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'E-commerce Sales', color: '#10B981', icon: <ShoppingCart size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Dropshipping', color: '#8B5CF6', icon: <ShoppingCart size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Blogging', color: '#EC4899', icon: <Book size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Podcasting', color: '#3B82F6', icon: <Mic2 size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Photography', color: '#F59E0B', icon: <Camera size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Graphic Design', color: '#10B981', icon: <Laptop size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Web Development', color: '#3B82F6', icon: <Laptop size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'App Development', color: '#8B5CF6', icon: <Smartphone size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Online Courses', color: '#EC4899', icon: <GraduationCap size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'E-books', color: '#F59E0B', icon: <Book size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Stock Photography', color: '#10B981', icon: <Camera size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Music Royalties', color: '#3B82F6', icon: <Headphones size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Patreon', color: '#EF4444', icon: <Heart size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Sponsorships', color: '#10B981', icon: <Handshake size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Donations', color: '#EC4899', icon: <Heart size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Crowdfunding', color: '#3B82F6', icon: <Users size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Peer-to-Peer Lending', color: '#F59E0B', icon: <Landmark size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Real Estate Crowdfunding', color: '#8B5CF6', icon: <Building2 size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'REITs', color: '#10B981', icon: <Building2 size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Bonds', color: '#3B82F6', icon: <Landmark size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Mutual Funds', color: '#F59E0B', icon: <TrendingUp size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'ETFs', color: '#10B981', icon: <TrendingUp size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Options Trading', color: '#EF4444', icon: <TrendingUp size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Forex Trading', color: '#3B82F6', icon: <Globe size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Commodities Trading', color: '#F59E0B', icon: <Gem size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Venture Capital', color: '#8B5CF6', icon: <Briefcase size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Angel Investing', color: '#EC4899', icon: <Heart size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Private Equity', color: '#10B981', icon: <Building2 size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Hedge Funds', color: '#3B82F6', icon: <Landmark size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Trust Fund', color: '#F59E0B', icon: <Landmark size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Settlement', color: '#EF4444', icon: <Gavel size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Severance Pay', color: '#10B981', icon: <Briefcase size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Unemployment Benefits', color: '#3B82F6', icon: <Landmark size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Disability Benefits', color: '#EC4899', icon: <HeartPulse size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Veterans Benefits', color: '#8B5CF6', icon: <ShieldCheck size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Welfare', color: '#10B981', icon: <Landmark size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Food Stamps', color: '#F59E0B', icon: <Utensils size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Housing Assistance', color: '#3B82F6', icon: <HomeIcon size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Energy Assistance', color: '#EF4444', icon: <Zap size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Tax Credit', color: '#10B981', icon: <Receipt size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Stimulus Check', color: '#3B82F6', icon: <Landmark size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Survey Junkie', color: '#8B5CF6', icon: <Laptop size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Swagbucks', color: '#EC4899', icon: <Laptop size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'InboxDollars', color: '#10B981', icon: <Laptop size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'MyPoints', color: '#3B82F6', icon: <Laptop size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Rakuten', color: '#F59E0B', icon: <ShoppingCart size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Ibotta', color: '#EF4444', icon: <ShoppingCart size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Dosh', color: '#10B981', icon: <ShoppingCart size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Fetch Rewards', color: '#3B82F6', icon: <ShoppingCart size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Receipt Hog', color: '#EC4899', icon: <ShoppingCart size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Checkout 51', color: '#8B5CF6', icon: <ShoppingCart size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Shopkick', color: '#10B981', icon: <ShoppingCart size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Drop', color: '#3B82F6', icon: <ShoppingCart size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Upwork', color: '#10B981', icon: <Laptop size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Fiverr', color: '#10B981', icon: <Laptop size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Freelancer', color: '#3B82F6', icon: <Laptop size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Toptal', color: '#8B5CF6', icon: <Laptop size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Guru', color: '#F59E0B', icon: <Laptop size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'PeoplePerHour', color: '#EC4899', icon: <Laptop size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'TaskRabbit', color: '#10B981', icon: <Wrench size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Thumbtack', color: '#3B82F6', icon: <Wrench size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Handy', color: '#F59E0B', icon: <Wrench size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Rover', color: '#EF4444', icon: <Dog size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Wag', color: '#10B981', icon: <Dog size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Care.com', color: '#3B82F6', icon: <Heart size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Sittercity', color: '#8B5CF6', icon: <Baby size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'UrbanSitter', color: '#EC4899', icon: <Baby size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Uber', color: '#10B981', icon: <Car size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Lyft', color: '#EC4899', icon: <Car size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'DoorDash', color: '#EF4444', icon: <Utensils size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'UberEats', color: '#10B981', icon: <Utensils size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Grubhub', color: '#F59E0B', icon: <Utensils size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Postmates', color: '#3B82F6', icon: <Utensils size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Instacart', color: '#10B981', icon: <ShoppingCart size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Shipt', color: '#8B5CF6', icon: <ShoppingCart size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Amazon Flex', color: '#F59E0B', icon: <Car size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Airbnb', color: '#EF4444', icon: <HomeIcon size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Vrbo', color: '#3B82F6', icon: <HomeIcon size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Turo', color: '#10B981', icon: <Car size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Getaround', color: '#8B5CF6', icon: <Car size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Etsy', color: '#F59E0B', icon: <ShoppingCart size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'eBay', color: '#3B82F6', icon: <ShoppingCart size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Poshmark', color: '#EC4899', icon: <Shirt size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Mercari', color: '#8B5CF6', icon: <ShoppingCart size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'OfferUp', color: '#10B981', icon: <ShoppingCart size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Craigslist', color: '#6B7280', icon: <ShoppingCart size={18} />, bg: 'bg-gray-100', text: 'text-gray-600' },
  { name: 'Facebook Marketplace', color: '#3B82F6', icon: <ShoppingCart size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Depop', color: '#EF4444', icon: <Shirt size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'ThredUp', color: '#10B981', icon: <Shirt size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'RealReal', color: '#F59E0B', icon: <Shirt size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'StockX', color: '#10B981', icon: <Shirt size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'GOAT', color: '#8B5CF6', icon: <Shirt size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Grailed', color: '#3B82F6', icon: <Shirt size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Decluttr', color: '#EC4899', icon: <Smartphone size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Gazelle', color: '#F59E0B', icon: <Smartphone size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Swappa', color: '#10B981', icon: <Smartphone size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Bookscouter', color: '#3B82F6', icon: <Book size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Chegg', color: '#F59E0B', icon: <Book size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Amazon Trade-In', color: '#F59E0B', icon: <ShoppingCart size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'GameStop Trade-In', color: '#EF4444', icon: <Gamepad2 size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Best Buy Trade-In', color: '#3B82F6', icon: <Smartphone size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Apple Trade In', color: '#6B7280', icon: <Smartphone size={18} />, bg: 'bg-gray-100', text: 'text-gray-600' },
  { name: 'Samsung Trade-In', color: '#3B82F6', icon: <Smartphone size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'AT&T Trade-In', color: '#3B82F6', icon: <Smartphone size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Verizon Trade-In', color: '#EF4444', icon: <Smartphone size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'T-Mobile Trade-In', color: '#EC4899', icon: <Smartphone size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Sprint Trade-In', color: '#F59E0B', icon: <Smartphone size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'CarMax', color: '#3B82F6', icon: <Car size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Carvana', color: '#10B981', icon: <Car size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Vroom', color: '#EF4444', icon: <Car size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Shift', color: '#8B5CF6', icon: <Car size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'WeBuyAnyCar', color: '#10B981', icon: <Car size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Peddle', color: '#F59E0B', icon: <Car size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Copart', color: '#3B82F6', icon: <Car size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'IAA', color: '#EF4444', icon: <Car size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'CashForCars', color: '#10B981', icon: <Car size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Wheelzy', color: '#8B5CF6', icon: <Car size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'JunkCarMedics', color: '#EC4899', icon: <Car size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'DamagedCars', color: '#EF4444', icon: <Car size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'CarBrain', color: '#3B82F6', icon: <Car size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'SellMyCar', color: '#10B981', icon: <Car size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'AutoLendersGo', color: '#F59E0B', icon: <Car size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Driveway', color: '#8B5CF6', icon: <Car size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'EchoPark', color: '#10B981', icon: <Car size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'TexasDirectAuto', color: '#EF4444', icon: <Car size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'OffLeaseOnly', color: '#3B82F6', icon: <Car size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'HGreg', color: '#EC4899', icon: <Car size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'ALM', color: '#10B981', icon: <Car size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Easterns', color: '#F59E0B', icon: <Car size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'MajorMotorCars', color: '#8B5CF6', icon: <Car size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'AutoBoutique', color: '#3B82F6', icon: <Car size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'GravityAutos', color: '#EF4444', icon: <Car size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'AtlantaAutos', color: '#10B981', icon: <Car size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'MariettaAutoSales', color: '#F59E0B', icon: <Car size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'ALM Roswell', color: '#8B5CF6', icon: <Car size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'ALM Kennesaw', color: '#3B82F6', icon: <Car size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'ALM Mall of Georgia', color: '#EC4899', icon: <Car size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'ALM South', color: '#10B981', icon: <Car size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'ALM Gwinnett', color: '#F59E0B', icon: <Car size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'ALM Marietta', color: '#EF4444', icon: <Car size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'ALM Newnan', color: '#3B82F6', icon: <Car size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'ALM Kia South', color: '#8B5CF6', icon: <Car size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'ALM Hyundai Florence', color: '#10B981', icon: <Car size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'ALM Ford', color: '#F59E0B', icon: <Car size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'ALM Chrysler Dodge Jeep Ram', color: '#EF4444', icon: <Car size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'ALM Chevrolet', color: '#3B82F6', icon: <Car size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'ALM Buick GMC', color: '#EC4899', icon: <Car size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'ALM Cadillac', color: '#10B981', icon: <Car size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'ALM Acura', color: '#F59E0B', icon: <Car size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'ALM Audi', color: '#8B5CF6', icon: <Car size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'ALM BMW', color: '#3B82F6', icon: <Car size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'ALM Honda', color: '#EF4444', icon: <Car size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'ALM Infiniti', color: '#10B981', icon: <Car size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'ALM Jaguar', color: '#F59E0B', icon: <Car size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'ALM Land Rover', color: '#EC4899', icon: <Car size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'ALM Lexus', color: '#3B82F6', icon: <Car size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'ALM Lincoln', color: '#8B5CF6', icon: <Car size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'ALM Maserati', color: '#10B981', icon: <Car size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'ALM Mazda', color: '#EF4444', icon: <Car size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'ALM Mercedes-Benz', color: '#F59E0B', icon: <Car size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'ALM Mini', color: '#3B82F6', icon: <Car size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'ALM Mitsubishi', color: '#10B981', icon: <Car size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'ALM Nissan', color: '#EC4899', icon: <Car size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'ALM Porsche', color: '#8B5CF6', icon: <Car size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'ALM Subaru', color: '#F59E0B', icon: <Car size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'ALM Toyota', color: '#3B82F6', icon: <Car size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'ALM Volkswagen', color: '#EF4444', icon: <Car size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'ALM Volvo', color: '#10B981', icon: <Car size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  
  { name: 'Other Income', color: '#6B7280', icon: <Plus size={18} />, bg: 'bg-gray-100', text: 'text-gray-600' },
];

const EXPENSE_CATEGORIES = [
  // --- DOCTOR (WIFE) PROFESSIONAL EXPENSES ---
  { name: 'Medical Equipment (Wife)', color: '#EC4899', icon: <Stethoscope size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Medical Books/Journals (Wife)', color: '#8B5CF6', icon: <Book size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'BMDC/Professional Fees (Wife)', color: '#6B7280', icon: <ShieldCheck size={18} />, bg: 'bg-gray-100', text: 'text-gray-600' },
  { name: 'CME/Conferences (Wife)', color: '#3B82F6', icon: <GraduationCap size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Scrubs/Lab Coats (Wife)', color: '#3B82F6', icon: <Shirt size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Malpractice Insurance (Wife)', color: '#EF4444', icon: <ShieldCheck size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  
  // --- PRIVATE COMPANY (USER) PROFESSIONAL EXPENSES ---
  { name: 'Professional Certifications', color: '#3B82F6', icon: <Award size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Business Attire/Suits', color: '#3B82F6', icon: <Shirt size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Commute (Office)', color: '#10B981', icon: <Car size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Networking/Lunch', color: '#EF4444', icon: <Utensils size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  
  // --- COW FARM EXPENSES ---
  { name: 'Cow Purchase (Investment)', color: '#F59E0B', icon: <ShoppingCart size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Goat Purchase (Investment)', color: '#F59E0B', icon: <ShoppingCart size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Cow Feed (Bhushi/Mix)', color: '#F59E0B', icon: <Wheat size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Straw/Hay (Khor)', color: '#F59E0B', icon: <Wheat size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Green Grass (Ghash)', color: '#10B981', icon: <Leaf size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Vet Doctor Fees', color: '#EC4899', icon: <Stethoscope size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Vaccines/Medicine (Cow)', color: '#EF4444', icon: <Syringe size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Disease Control (IBR/FMD)', color: '#EF4444', icon: <ShieldCheck size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Biosecurity & Sanitation', color: '#10B981', icon: <ShieldCheck size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Farm Labor Wages', color: '#6B7280', icon: <UserIcon size={18} />, bg: 'bg-gray-100', text: 'text-gray-600' },
  { name: 'Shed Maintenance/Repair', color: '#6B7280', icon: <Wrench size={18} />, bg: 'bg-gray-100', text: 'text-gray-600' },
  { name: 'Electricity/Water (Farm)', color: '#F59E0B', icon: <Zap size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  
  // --- ESSENTIALS ---
  { name: 'Food & Grocery', color: '#EF4444', icon: <Utensils size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'House Rent', color: '#F59E0B', icon: <HomeIcon size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Electricity Bill (Home)', color: '#F59E0B', icon: <Zap size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Water/Gas Bills', color: '#3B82F6', icon: <Droplets size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Internet/WiFi', color: '#3B82F6', icon: <Wifi size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Mobile Recharge', color: '#6366F1', icon: <Smartphone size={18} />, bg: 'bg-indigo-100', text: 'text-indigo-600' },
  
  // --- TRANSPORT ---
  { name: 'Uber/Pathao', color: '#10B981', icon: <Car size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Fuel/Gasoline', color: '#EF4444', icon: <Flame size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Car Maintenance', color: '#6B7280', icon: <Wrench size={18} />, bg: 'bg-gray-100', text: 'text-gray-600' },
  
  // --- FAMILY & LIFESTYLE ---
  { name: 'Child Education/Fees', color: '#8B5CF6', icon: <GraduationCap size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Parents Support', color: '#8B5CF6', icon: <Heart size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'In-laws Support', color: '#8B5CF6', icon: <Heart size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Sibling Support', color: '#8B5CF6', icon: <Heart size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Medical (Family)', color: '#EC4899', icon: <HeartPulse size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Clothing/Shopping', color: '#3B82F6', icon: <Shirt size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Gym/Fitness', color: '#10B981', icon: <Dumbbell size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Salon/Spa/Beauty', color: '#EC4899', icon: <Scissors size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Gifts (Wedding/Bday)', color: '#EC4899', icon: <Gift size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Charity/Zakat', color: '#10B981', icon: <Gift size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  
  // --- BABY & CHILDCARE ---
  { name: 'Baby Diapers/Wipes', color: '#3B82F6', icon: <Baby size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Baby Formula/Food', color: '#F59E0B', icon: <Utensils size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Baby Clothes/Shoes', color: '#EC4899', icon: <Shirt size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Baby Toys/Books', color: '#8B5CF6', icon: <Gamepad2 size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Nanny/Sitter Wages', color: '#6B7280', icon: <UserIcon size={18} />, bg: 'bg-gray-100', text: 'text-gray-600' },
  { name: 'Daycare/Pre-school', color: '#8B5CF6', icon: <School size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Baby Medical/Vaccine', color: '#EF4444', icon: <Syringe size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Stroller/Baby Gear', color: '#6B7280', icon: <BaggageClaim size={18} />, bg: 'bg-gray-100', text: 'text-gray-600' },
  
  // --- HOME SERVICES ---
  { name: 'Maid/Cleaner Wages', color: '#6B7280', icon: <UserIcon size={18} />, bg: 'bg-gray-100', text: 'text-gray-600' },
  { name: 'Laundry/Dry Cleaning', color: '#3B82F6', icon: <Shirt size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Pest Control', color: '#EF4444', icon: <ShieldCheck size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Newspaper/Magazines', color: '#6B7280', icon: <BookOpen size={18} />, bg: 'bg-gray-100', text: 'text-gray-600' },
  
  // --- FESTIVALS & SHARED ---
  { name: 'Meat Purchase (Shared)', color: '#EF4444', icon: <Utensils size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Shared Expense (Friends)', color: '#3B82F6', icon: <Handshake size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Eid Shopping/Gift', color: '#EC4899', icon: <Gift size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Qurbani Shared Cost', color: '#F59E0B', icon: <Coins size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  
  // --- ENTERTAINMENT & LUXURY ---
  { name: 'Dining Out', color: '#EF4444', icon: <Utensils size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Travel (Domestic)', color: '#3B82F6', icon: <Bus size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Travel (International)', color: '#8B5CF6', icon: <Plane size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Luxury Watches/Jewelry', color: '#F59E0B', icon: <Gem size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Gadgets/Electronics', color: '#3B82F6', icon: <Smartphone size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Netflix/Spotify/Sub', color: '#EF4444', icon: <Tv size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  
  // --- FINANCIAL ---
  { name: 'Loan EMI/Repayment', color: '#EF4444', icon: <Landmark size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Credit Card Bill', color: '#EF4444', icon: <CreditCard size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Income Tax', color: '#EF4444', icon: <Scale size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Insurance Premium', color: '#3B82F6', icon: <ShieldCheck size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Bank Charges', color: '#6B7280', icon: <Receipt size={18} />, bg: 'bg-gray-100', text: 'text-gray-600' },
  { name: 'Savings Deposit', color: '#10B981', icon: <PiggyBank size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  
  // --- LIFETIME & FUTURE EXPENSES ---
  { name: 'Daily Tea/Snacks (Tiffin)', color: '#F59E0B', icon: <Coffee size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Daily Parking/Tolls', color: '#6B7280', icon: <Car size={18} />, bg: 'bg-gray-100', text: 'text-gray-600' },
  { name: 'Monthly Sub (500 Tk/Rs)', color: '#EF4444', icon: <RefreshCw size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Religious Pilgrimage', color: '#F59E0B', icon: <Globe size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Wedding/Event Planning', color: '#EC4899', icon: <Heart size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Legal Fees/Court Costs', color: '#6B7280', icon: <Gavel size={18} />, bg: 'bg-gray-100', text: 'text-gray-600' },
  { name: 'Passport/Visa/Govt Fees', color: '#3B82F6', icon: <Plane size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Elderly Care/Nursing', color: '#EC4899', icon: <HeartPulse size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Chronic Medicine (Long)', color: '#EF4444', icon: <Syringe size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Pet Care (Vet/Food)', color: '#F59E0B', icon: <Dog size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Hobby Supplies', color: '#8B5CF6', icon: <Gamepad2 size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Cloud Storage/Digital', color: '#3B82F6', icon: <Cloud size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Disaster Recovery', color: '#EF4444', icon: <ZapOff size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Theft/Loss Replacement', color: '#6B7280', icon: <Trash2 size={18} />, bg: 'bg-gray-100', text: 'text-gray-600' },
  { name: 'Club Membership', color: '#10B981', icon: <Building2 size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  
  // --- MISC ---
  { name: 'Maintenance (Home)', color: '#6B7280', icon: <Wrench size={18} />, bg: 'bg-gray-100', text: 'text-gray-600' },
  
  // --- NEW EXPENSE CATEGORIES ---
  { name: 'Restaurant Bill', color: '#EF4444', icon: <Utensils size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Transport', color: '#3B82F6', icon: <Bus size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Coffee/Tea', color: '#F59E0B', icon: <Coffee size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Fast Food', color: '#EF4444', icon: <Utensils size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Snacks', color: '#F59E0B', icon: <Utensils size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Alcohol/Drinks', color: '#8B5CF6', icon: <GlassWater size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Cigarettes/Tobacco', color: '#6B7280', icon: <Flame size={18} />, bg: 'bg-gray-100', text: 'text-gray-600' },
  { name: 'Movie Tickets', color: '#EC4899', icon: <Film size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Concert/Event Tickets', color: '#8B5CF6', icon: <Ticket size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Books/Magazines', color: '#3B82F6', icon: <BookOpen size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Video Games', color: '#10B981', icon: <Gamepad2 size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'App Subscriptions', color: '#3B82F6', icon: <Smartphone size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Software Licenses', color: '#8B5CF6', icon: <Laptop size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Online Gaming', color: '#EF4444', icon: <Gamepad2 size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Sports Equipment', color: '#F59E0B', icon: <Dumbbell size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Gym Membership', color: '#10B981', icon: <Dumbbell size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Fitness Classes', color: '#EC4899', icon: <Activity size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Personal Trainer', color: '#3B82F6', icon: <UserIcon size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Haircut/Salon', color: '#EC4899', icon: <Scissors size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Spa/Massage', color: '#8B5CF6', icon: <HeartPulse size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Cosmetics/Makeup', color: '#EC4899', icon: <Sparkles size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Skincare Products', color: '#10B981', icon: <Droplets size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Perfume/Cologne', color: '#F59E0B', icon: <Wind size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Clothing (Casual)', color: '#3B82F6', icon: <Shirt size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Clothing (Formal)', color: '#8B5CF6', icon: <Briefcase size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Shoes/Footwear', color: '#EF4444', icon: <Footprints size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Accessories (Bags/Belts)', color: '#F59E0B', icon: <Briefcase size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Jewelry/Watches', color: '#10B981', icon: <Gem size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Dry Cleaning/Laundry', color: '#3B82F6', icon: <Shirt size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Tailoring/Alterations', color: '#EC4899', icon: <Scissors size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Home Decor', color: '#F59E0B', icon: <HomeIcon size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Furniture', color: '#8B5CF6', icon: <Sofa size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Kitchen Appliances', color: '#EF4444', icon: <Coffee size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Electronics (TV/Audio)', color: '#3B82F6', icon: <Tv size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Computers/Laptops', color: '#10B981', icon: <Laptop size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Smartphones/Tablets', color: '#EC4899', icon: <Smartphone size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Home Repairs', color: '#6B7280', icon: <Wrench size={18} />, bg: 'bg-gray-100', text: 'text-gray-600' },
  { name: 'Plumbing Services', color: '#3B82F6', icon: <Droplets size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Electrical Services', color: '#F59E0B', icon: <Zap size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Cleaning Supplies', color: '#10B981', icon: <Sparkles size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Garden/Lawn Care', color: '#10B981', icon: <Leaf size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Pet Food', color: '#F59E0B', icon: <Dog size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Pet Toys/Accessories', color: '#8B5CF6', icon: <Gamepad2 size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Veterinary Bills', color: '#EF4444', icon: <Stethoscope size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Pet Grooming', color: '#EC4899', icon: <Scissors size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Pet Boarding/Sitting', color: '#3B82F6', icon: <HomeIcon size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Car Wash/Detailing', color: '#3B82F6', icon: <Car size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Parking Fees', color: '#6B7280', icon: <Car size={18} />, bg: 'bg-gray-100', text: 'text-gray-600' },
  { name: 'Toll Fees', color: '#F59E0B', icon: <Car size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Car Insurance', color: '#10B981', icon: <ShieldCheck size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Car Registration/Taxes', color: '#EF4444', icon: <Receipt size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Public Transit (Bus/Train)', color: '#3B82F6', icon: <Bus size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Taxi/Rideshare', color: '#F59E0B', icon: <Car size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Flights/Airfare', color: '#8B5CF6', icon: <Plane size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Hotel/Accommodation', color: '#EC4899', icon: <HomeIcon size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Travel Insurance', color: '#10B981', icon: <ShieldCheck size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Visa/Passport Fees', color: '#3B82F6', icon: <Globe size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Souvenirs/Gifts', color: '#EC4899', icon: <Gift size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Doctor Visits', color: '#EF4444', icon: <Stethoscope size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Dental Care', color: '#3B82F6', icon: <Smile size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Vision Care (Glasses/Contacts)', color: '#8B5CF6', icon: <Eye size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Prescription Medications', color: '#10B981', icon: <Pill size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Over-the-Counter Meds', color: '#F59E0B', icon: <Pill size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Health Insurance Premium', color: '#3B82F6', icon: <ShieldCheck size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Life Insurance Premium', color: '#8B5CF6', icon: <ShieldCheck size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Therapy/Counseling', color: '#EC4899', icon: <Heart size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Hospital Bills', color: '#EF4444', icon: <Hospital size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Medical Devices/Equipment', color: '#6B7280', icon: <Stethoscope size={18} />, bg: 'bg-gray-100', text: 'text-gray-600' },
  { name: 'School/College Tuition', color: '#3B82F6', icon: <GraduationCap size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'School Supplies/Stationery', color: '#F59E0B', icon: <PenTool size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Textbooks', color: '#10B981', icon: <Book size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Tutoring/Extra Classes', color: '#8B5CF6', icon: <UserIcon size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Student Loan Payment', color: '#EF4444', icon: <Landmark size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Online Courses/Certificates', color: '#3B82F6', icon: <Laptop size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Extracurricular Activities', color: '#EC4899', icon: <Activity size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Childcare/Babysitting', color: '#F59E0B', icon: <Baby size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Toys/Games for Kids', color: '#10B981', icon: <Gamepad2 size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Kids Clothing/Shoes', color: '#3B82F6', icon: <Shirt size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Diapers/Baby Supplies', color: '#EC4899', icon: <Baby size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Allowances/Pocket Money', color: '#8B5CF6', icon: <Coins size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Gifts for Family/Friends', color: '#EC4899', icon: <Gift size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Donations/Charity', color: '#10B981', icon: <Heart size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Religious Contributions', color: '#F59E0B', icon: <Landmark size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Alimony/Child Support', color: '#EF4444', icon: <Heart size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Taxes (Property/Income)', color: '#EF4444', icon: <Receipt size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Legal Fees', color: '#6B7280', icon: <Gavel size={18} />, bg: 'bg-gray-100', text: 'text-gray-600' },
  { name: 'Accounting/Tax Prep Fees', color: '#3B82F6', icon: <Calculator size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Bank Fees/Service Charges', color: '#6B7280', icon: <Landmark size={18} />, bg: 'bg-gray-100', text: 'text-gray-600' },
  { name: 'Credit Card Fees/Interest', color: '#EF4444', icon: <CreditCard size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Late Fees/Penalties', color: '#EF4444', icon: <AlertCircle size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Postage/Shipping', color: '#F59E0B', icon: <Package size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Printing/Copying', color: '#3B82F6', icon: <Printer size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Office Supplies', color: '#10B981', icon: <Paperclip size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Software Subscriptions (Work)', color: '#8B5CF6', icon: <Laptop size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Professional Memberships', color: '#3B82F6', icon: <Award size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Conferences/Seminars', color: '#EC4899', icon: <Users size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Business Travel', color: '#F59E0B', icon: <Plane size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Business Meals/Entertainment', color: '#EF4444', icon: <Utensils size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Advertising/Marketing', color: '#10B981', icon: <Megaphone size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Website Hosting/Domains', color: '#3B82F6', icon: <Globe size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Freelancer/Contractor Fees', color: '#8B5CF6', icon: <UserIcon size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Business Insurance', color: '#10B981', icon: <ShieldCheck size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Rent (Office/Commercial)', color: '#F59E0B', icon: <Building2 size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Utilities (Office)', color: '#3B82F6', icon: <Zap size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Equipment Purchase (Business)', color: '#6B7280', icon: <Laptop size={18} />, bg: 'bg-gray-100', text: 'text-gray-600' },
  { name: 'Equipment Repair (Business)', color: '#EF4444', icon: <Wrench size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Inventory/Supplies (Business)', color: '#10B981', icon: <Package size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Taxes (Business)', color: '#EF4444', icon: <Receipt size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Loan Repayment (Business)', color: '#F59E0B', icon: <Landmark size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Licenses/Permits', color: '#3B82F6', icon: <FileText size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Fines/Tickets', color: '#EF4444', icon: <AlertTriangle size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Lottery/Gambling', color: '#8B5CF6', icon: <Dice5 size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Investments (Stocks/Crypto)', color: '#10B981', icon: <TrendingUp size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Savings/Emergency Fund', color: '#3B82F6', icon: <PiggyBank size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Retirement Contributions', color: '#F59E0B', icon: <Landmark size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Real Estate Investments', color: '#8B5CF6', icon: <HomeIcon size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Debt Repayment (Personal)', color: '#EF4444', icon: <CreditCard size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Personal Loan Repayment', color: '#F59E0B', icon: <Landmark size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Mortgage Payment', color: '#3B82F6', icon: <HomeIcon size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Property Taxes', color: '#EF4444', icon: <Receipt size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Homeowners Association (HOA)', color: '#10B981', icon: <Building2 size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Home Security/Alarm', color: '#3B82F6', icon: <ShieldCheck size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Lawn Care/Landscaping', color: '#10B981', icon: <Leaf size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Pool Maintenance', color: '#3B82F6', icon: <Droplets size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Snow Removal', color: '#6B7280', icon: <CloudSnow size={18} />, bg: 'bg-gray-100', text: 'text-gray-600' },
  { name: 'Trash/Recycling Collection', color: '#6B7280', icon: <Trash2 size={18} />, bg: 'bg-gray-100', text: 'text-gray-600' },
  { name: 'Water/Sewer Bill', color: '#3B82F6', icon: <Droplets size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Gas/Heating Bill', color: '#EF4444', icon: <Flame size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Electricity Bill', color: '#F59E0B', icon: <Zap size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Internet/Cable Bill', color: '#3B82F6', icon: <Wifi size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Phone Bill (Cell/Landline)', color: '#8B5CF6', icon: <Smartphone size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Streaming Services (Netflix, etc.)', color: '#EF4444', icon: <Tv size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Music Subscriptions (Spotify, etc.)', color: '#10B981', icon: <Headphones size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Gym/Fitness Memberships', color: '#F59E0B', icon: <Dumbbell size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Club/Association Dues', color: '#3B82F6', icon: <Users size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Magazine/Newspaper Subscriptions', color: '#6B7280', icon: <BookOpen size={18} />, bg: 'bg-gray-100', text: 'text-gray-600' },
  { name: 'Software/App Subscriptions', color: '#8B5CF6', icon: <Laptop size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Cloud Storage Subscriptions', color: '#3B82F6', icon: <Cloud size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Delivery Services (Amazon Prime)', color: '#F59E0B', icon: <Package size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Meal Kit Delivery', color: '#10B981', icon: <Utensils size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Grocery Delivery Fees', color: '#3B82F6', icon: <ShoppingCart size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Rideshare/Taxi (Uber, Lyft)', color: '#EC4899', icon: <Car size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Public Transportation (Bus, Train)', color: '#10B981', icon: <Bus size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Parking Fees/Tolls', color: '#F59E0B', icon: <Car size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Gas/Fuel for Vehicle', color: '#EF4444', icon: <Flame size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Vehicle Maintenance/Repairs', color: '#6B7280', icon: <Wrench size={18} />, bg: 'bg-gray-100', text: 'text-gray-600' },
  { name: 'Vehicle Registration/Taxes', color: '#3B82F6', icon: <Receipt size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Vehicle Insurance', color: '#10B981', icon: <ShieldCheck size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Bicycle Maintenance/Gear', color: '#F59E0B', icon: <Bike size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Hotels/Lodging', color: '#EC4899', icon: <HomeIcon size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Rental Cars', color: '#3B82F6', icon: <Car size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Passport/Visa Fees', color: '#F59E0B', icon: <Globe size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Souvenirs/Gifts (Travel)', color: '#8B5CF6', icon: <Gift size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Dining Out (Restaurants)', color: '#EF4444', icon: <Utensils size={18} />, bg: 'bg-red-100', text: 'text-red-600' },
  { name: 'Fast Food/Takeout', color: '#F59E0B', icon: <Utensils size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Coffee Shops/Cafes', color: '#8B5CF6', icon: <Coffee size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Bars/Alcohol', color: '#EC4899', icon: <GlassWater size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Groceries/Supermarket', color: '#10B981', icon: <ShoppingCart size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Farmers Market/Produce', color: '#F59E0B', icon: <Leaf size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Convenience Store/Snacks', color: '#3B82F6', icon: <ShoppingCart size={18} />, bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'Clothing/Apparel', color: '#EC4899', icon: <Shirt size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Accessories (Jewelry, Bags)', color: '#F59E0B', icon: <Briefcase size={18} />, bg: 'bg-amber-100', text: 'text-amber-600' },
  { name: 'Haircuts/Salon Services', color: '#EC4899', icon: <Scissors size={18} />, bg: 'bg-pink-100', text: 'text-pink-600' },
  { name: 'Spa/Massage/Nails', color: '#8B5CF6', icon: <HeartPulse size={18} />, bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'Skincare/Toiletries', color: '#10B981', icon: <Droplets size={18} />, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { name: 'Other Expense', color: '#6B7280', icon: <Minus size={18} />, bg: 'bg-gray-100', text: 'text-gray-600' },
];

const INITIAL_TRANSACTIONS = [];

// --- Components ---

const ScreenWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.05 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col h-full pb-24 overflow-y-auto bg-white"
  >
    {children}
  </motion.div>
);

const Header = ({ 
  title, 
  showSearch = true, 
  onMenuClick,
  searchQuery,
  onSearchChange,
  notifications,
  onMarkRead
}: { 
  title: string; 
  showSearch?: boolean; 
  onMenuClick?: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  notifications: any[];
  onMarkRead: () => void;
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex items-center justify-between px-6 pt-8 pb-4 min-h-[80px] relative z-20">
      <div className="flex items-center gap-3 flex-1">
        {!isSearching ? (
          <>
            <button 
              onClick={onMenuClick}
              className="p-2.5 bg-white rounded-xl hover:bg-slate-50 transition-colors shadow-sm border border-slate-100"
            >
              <Menu size={20} className="text-slate-700" />
            </button>
            <h1 className="text-xl font-display font-bold text-slate-900 truncate">{title}</h1>
          </>
        ) : (
          <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-4 py-3 shadow-sm border border-slate-100">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search transactions..."
              className="bg-transparent outline-none text-sm font-medium text-slate-900 w-full"
              autoFocus
            />
            <button onClick={() => { setIsSearching(false); onSearchChange?.(''); }}>
              <X size={18} className="text-slate-400 hover:text-slate-600" />
            </button>
          </div>
        )}
      </div>
      
      {!isSearching && (
        <div className="flex items-center gap-3 ml-3">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 bg-white rounded-xl hover:bg-slate-50 transition-colors shadow-sm border border-slate-100 relative"
            >
              <Bell size={20} className="text-slate-700" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            
            <AnimatePresence>
              {showNotifications && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <h3 className="font-semibold text-slate-900">Notifications</h3>
                      <button 
                        onClick={onMarkRead}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <Bell size={32} className="mx-auto text-slate-200 mb-2" />
                          <p className="text-sm text-slate-400">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map(notification => (
                          <div 
                            key={notification.id} 
                            className={cn(
                              "p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer",
                              !notification.read && "bg-blue-50/30"
                            )}
                          >
                            <div className="flex gap-3">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                notification.type === 'alert' ? 'bg-red-100 text-red-600' :
                                notification.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                                'bg-blue-100 text-blue-600'
                              )}>
                                {notification.type === 'alert' ? <AlertTriangle size={14} /> :
                                 notification.type === 'success' ? <Check size={14} /> :
                                 <Bell size={14} />}
                              </div>
                              <div>
                                <h4 className={cn(
                                  "text-sm font-medium",
                                  !notification.read ? "text-slate-900" : "text-slate-700"
                                )}>
                                  {notification.title}
                                </h4>
                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                  {notification.message}
                                </p>
                                <span className="text-[10px] font-medium text-slate-400 mt-2 block">
                                  {notification.time}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 text-center border-t border-slate-100 bg-slate-50/50">
                      <button className="text-sm font-medium text-slate-600 hover:text-slate-900">
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {showSearch && (
            <button 
              onClick={() => setIsSearching(true)}
              className="p-2.5 bg-white rounded-xl hover:bg-slate-50 transition-colors shadow-sm border border-slate-100"
            >
              <Search size={20} className="text-slate-700" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const Sidebar = ({ 
  isOpen, 
  onClose, 
  profile, 
  onTabChange, 
  onLogout,
  activeTab,
  isGoogleConnected,
  onConnectGoogle,
  onSync
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  profile: any;
  onTabChange: (tab: 'dashboard' | 'summary' | 'history' | 'profile') => void;
  onLogout: () => void;
  activeTab: string;
  isGoogleConnected: boolean;
  onConnectGoogle: () => void;
  onSync: () => void;
}) => {
  const sidebarContent = (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 shadow-sm">
          {profile.avatar ? (
            <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <UserIcon size={24} />
            </div>
          )}
        </div>
        <div>
          <p className="font-display font-bold text-slate-900 leading-tight text-lg">{profile.name}</p>
          <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mt-0.5">Premium Member</p>
        </div>
      </div>

      <div className="space-y-2 flex-1">
        <button 
          onClick={() => { onTabChange('dashboard'); onClose(); }}
          className={cn(
            "flex items-center gap-4 w-full p-4 rounded-2xl transition-all group",
            activeTab === 'dashboard' ? "premium-gradient text-white shadow-lg shadow-indigo-500/20" : "text-slate-600 hover:bg-slate-50"
          )}
        >
          <LayoutDashboard size={20} className={cn(activeTab === 'dashboard' ? "text-white" : "text-slate-400 group-hover:text-indigo-500 transition-colors")} />
          <span className="font-bold">Dashboard</span>
        </button>
        <button 
          onClick={() => { onTabChange('summary'); onClose(); }}
          className={cn(
            "flex items-center gap-4 w-full p-4 rounded-2xl transition-all group",
            activeTab === 'summary' ? "premium-gradient text-white shadow-lg shadow-indigo-500/20" : "text-slate-600 hover:bg-slate-50"
          )}
        >
          <PieChartIcon size={20} className={cn(activeTab === 'summary' ? "text-white" : "text-slate-400 group-hover:text-indigo-500 transition-colors")} />
          <span className="font-bold">Statistics</span>
        </button>
        <button 
          onClick={() => { onTabChange('history'); onClose(); }}
          className={cn(
            "flex items-center gap-4 w-full p-4 rounded-2xl transition-all group",
            activeTab === 'history' ? "premium-gradient text-white shadow-lg shadow-indigo-500/20" : "text-slate-600 hover:bg-slate-50"
          )}
        >
          <History size={20} className={cn(activeTab === 'history' ? "text-white" : "text-slate-400 group-hover:text-indigo-500 transition-colors")} />
          <span className="font-bold">History</span>
        </button>
        <div className="h-px bg-slate-100 my-4" />
        <button 
          onClick={() => { onTabChange('profile'); onClose(); }}
          className={cn(
            "flex items-center gap-4 w-full p-4 rounded-2xl transition-all group",
            activeTab === 'profile' ? "premium-gradient text-white shadow-lg shadow-indigo-500/20" : "text-slate-600 hover:bg-slate-50"
          )}
        >
          <Settings size={20} className={cn(activeTab === 'profile' ? "text-white" : "text-slate-400 group-hover:text-indigo-500 transition-colors")} />
          <span className="font-bold">Settings</span>
        </button>
        <button 
          onClick={onConnectGoogle}
          disabled={isGoogleConnected}
          className={cn(
            "flex items-center gap-4 w-full p-4 rounded-2xl transition-all group mt-2",
            isGoogleConnected ? "text-emerald-600 bg-emerald-50" : "text-slate-600 hover:bg-slate-50"
          )}
        >
          <FileSpreadsheet size={20} className={cn(isGoogleConnected ? "text-emerald-500" : "text-slate-400 group-hover:text-indigo-500 transition-colors")} />
          <span className="font-bold">{isGoogleConnected ? 'Sheets Connected' : 'Connect Sheets'}</span>
        </button>
        {isGoogleConnected && (
          <button 
            onClick={() => onSync()}
            className="flex items-center gap-4 w-full p-4 rounded-2xl transition-all group text-indigo-600 hover:bg-indigo-50"
          >
            <RefreshCw size={20} className="text-indigo-400 group-hover:text-indigo-600 transition-colors" />
            <span className="font-bold">Sync from Sheet</span>
          </button>
        )}
      </div>

      <button 
        onClick={() => { onLogout(); onClose(); }}
        className="mt-auto flex items-center gap-4 text-red-500 font-bold hover:bg-red-50 p-4 rounded-2xl transition-colors group"
      >
        <div className="p-2 bg-red-50 rounded-xl group-hover:bg-red-100 transition-colors">
          <X size={20} className="text-red-500" />
        </div>
        <span>Logout</span>
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-3/4 max-w-xs bg-white z-[70] shadow-2xl p-8 flex flex-col lg:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-80 bg-white border-r border-gray-100 p-8 h-screen sticky top-0">
        {sidebarContent}
      </div>
    </>
  );
};

const Dashboard = ({ 
  transactions, 
  onMenuClick, 
  selectedMonth,
  onMonthChange,
  searchQuery,
  onSearchChange,
  onTabChange,
  notifications,
  onMarkRead,
  isSyncing,
  budgets,
  onUpdateBudgets,
  profile,
  setPendingTransactionType,
  setActiveTab
}: { 
  transactions: typeof INITIAL_TRANSACTIONS; 
  onMenuClick: () => void;
  selectedMonth: string;
  onMonthChange: (val: string) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onTabChange: (tab: string) => void;
  notifications: any[];
  onMarkRead: () => void;
  isSyncing: boolean;
  budgets: Budget[];
  onUpdateBudgets: (budgets: Budget[]) => void;
  profile: any;
  setPendingTransactionType: (type: 'expense' | 'income' | null) => void;
  setActiveTab: (tab: 'dashboard' | 'summary' | 'history' | 'profile' | 'add') => void;
  key?: string;
}) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const years = Array.from({ length: 81 }, (_, i) => 2000 + i);

  const [pickerMonth, pickerYear] = selectedMonth.split(' ');

  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [viewType, setViewType] = useState<'monthly' | 'yearly'>('monthly');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiInsights, setAiInsights] = useState<string[]>(() => {
    const saved = localStorage.getItem('financier_ai_insights');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('financier_ai_insights', JSON.stringify(aiInsights));
  }, [aiInsights]);

  const fetchAIInsights = async () => {
    setIsGeneratingAI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `
        You are a professional financial advisor for an app called Financier.
        Analyze the following financial data for ${profile.name}:
        
        Transactions (last few): ${JSON.stringify(transactions.slice(0, 20))}
        Budgets: ${JSON.stringify(budgets)}
        
        Provide 3 concise, actionable financial insights or tips based on their spending and budgets. 
        Keep them encouraging, professional, and very short (max 15 words each).
        Format the response strictly as a JSON array of strings.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const text = response.text;
      if (text) {
        // Extract JSON array from text
        const jsonMatch = text.match(/\[.*\]/s);
        const insights = jsonMatch ? JSON.parse(jsonMatch[0]) : [text];
        setAiInsights(insights);
      }
    } catch (e) {
      console.error('AI Insights failed', e);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const monthStats = useMemo(() => {
    const mIdx = months.indexOf(pickerMonth);
    const year = parseInt(pickerYear);
    
    const filtered = transactions.filter(t => {
      const [, mPart, yPart] = t.date.split(',')[0].split('-');
      return (parseInt(mPart) - 1) === mIdx && parseInt(yPart) === year;
    });

    const inc = filtered.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
    const exp = filtered.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);
    
    return { income: inc, expenses: exp, balance: inc - exp };
  }, [transactions, pickerMonth, pickerYear, months]);

  const lifetimeStats = useMemo(() => {
    const inc = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
    const exp = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);
    return { income: inc, expenses: exp, balance: inc - exp };
  }, [transactions]);

  const [visibleLines, setVisibleLines] = useState({ income: true, expenses: true });

  const toggleLine = (line: 'income' | 'expenses') => {
    setVisibleLines(prev => ({ ...prev, [line]: !prev[line] }));
  };

  const chartData = useMemo(() => {
    if (viewType === 'monthly') {
      const mIdx = months.indexOf(pickerMonth);
      const year = parseInt(pickerYear);
      const daysInMonth = new Date(year, mIdx + 1, 0).getDate();
      
      const data = Array.from({ length: daysInMonth }, (_, i) => ({
        name: String(i + 1),
        income: 0,
        expenses: 0
      }));

      transactions.forEach(t => {
        const [dPart, mPart, yPart] = t.date.split(',')[0].split('-');
        const tDay = parseInt(dPart);
        const tMonth = parseInt(mPart) - 1;
        const tYear = parseInt(yPart);

        if (tMonth === mIdx && tYear === year && tDay <= daysInMonth) {
          if (t.amount > 0) {
            data[tDay - 1].income += t.amount;
          } else {
            data[tDay - 1].expenses += Math.abs(t.amount);
          }
        }
      });
      return data;
    } else {
      const year = parseInt(pickerYear);
      const data = months.map(m => ({
        name: m,
        income: 0,
        expenses: 0
      }));

      transactions.forEach(t => {
        const [, mPart, yPart] = t.date.split(',')[0].split('-');
        const tMonth = parseInt(mPart) - 1;
        const tYear = parseInt(yPart);

        if (tYear === year) {
          if (t.amount > 0) {
            data[tMonth].income += t.amount;
          } else {
            data[tMonth].expenses += Math.abs(t.amount);
          }
        }
      });
      return data;
    }
  }, [transactions, selectedMonth, viewType, months, pickerMonth, pickerYear]);

  return (
    <ScreenWrapper>
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header 
          title="Personal Account" 
          onMenuClick={onMenuClick} 
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          notifications={notifications}
          onMarkRead={onMarkRead}
        />
        
        <AnimatePresence>
          {isSyncing && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-indigo-600 text-white px-6 py-2 flex items-center justify-center gap-2 text-xs font-bold overflow-hidden"
            >
              <RefreshCw size={12} className="animate-spin" />
              <span>Syncing with Google Sheets...</span>
            </motion.div>
          )}
        </AnimatePresence>
          {/* Balance Card */}
          <div className="relative overflow-hidden premium-gradient rounded-[32px] p-8 text-white shadow-2xl shadow-indigo-500/20">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />
            
            <div className="relative z-10 flex justify-between items-start mb-8">
              <div>
                <p className="text-indigo-100 text-sm font-medium mb-1">Total Balance</p>
                <h2 className="text-4xl font-display font-bold tracking-tight">{lifetimeStats.balance.toLocaleString()} Tk</h2>
              </div>
              <div className="text-right">
                <p className="text-indigo-100 text-sm font-medium mb-1">This month</p>
                <div className="flex items-center gap-1 font-semibold justify-end bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
                  <ArrowUpRight size={14} />
                  <span className="text-sm">+{monthStats.income.toLocaleString()} Tk</span>
                </div>
              </div>
            </div>
            
            <div className="relative z-10 flex items-center justify-between pt-6 border-t border-white/20">
              <div>
                <p className="text-indigo-100 text-xs font-medium mb-1">Total Expenses</p>
                <p className="font-semibold text-lg">{lifetimeStats.expenses.toLocaleString()} Tk</p>
              </div>
              <div className="text-center">
                <p className="text-indigo-100 text-xs font-medium mb-1">Savings Rate</p>
                <p className="font-semibold text-lg">
                  {lifetimeStats.income > 0 ? ((lifetimeStats.balance / lifetimeStats.income) * 100).toFixed(0) : 0}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-indigo-100 text-xs font-medium mb-1">Total Income</p>
                <p className="font-semibold text-lg">{lifetimeStats.income.toLocaleString()} Tk</p>
              </div>
            </div>
          </div>

        {/* Lifetime Summary */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 mb-4">
              <ArrowUpRight size={24} strokeWidth={2.5} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Lifetime Income</p>
            <p className="text-xl font-display font-bold text-slate-900">{lifetimeStats.income.toLocaleString()} Tk</p>
          </div>
          <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500 mb-4">
              <ArrowDownLeft size={24} strokeWidth={2.5} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Lifetime Cost</p>
            <p className="text-xl font-display font-bold text-slate-900">{lifetimeStats.expenses.toLocaleString()} Tk</p>
          </div>
        </div>

        {/* AI Financial Insights */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="text-indigo-500" size={20} />
              AI Insights
            </h3>
            <button 
              onClick={fetchAIInsights}
              disabled={isGeneratingAI}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-50 flex items-center gap-1"
            >
              {isGeneratingAI ? (
                <>
                  <RefreshCw size={12} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <RefreshCw size={12} />
                  Refresh
                </>
              )}
            </button>
          </div>
          <div className="grid gap-3">
            {aiInsights.length > 0 ? (
              aiInsights.map((insight, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 flex gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  </div>
                  <p className="text-sm text-indigo-900 font-medium leading-relaxed">{insight}</p>
                </motion.div>
              ))
            ) : (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <p className="text-sm text-slate-500 font-medium">Click refresh to get personalized AI financial tips.</p>
              </div>
            )}
          </div>
        </div>

        {/* Cash Flow Chart */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <h3 className="text-lg font-bold text-gray-900">Cash Flow</h3>
              <div className="flex gap-2 mt-1">
                <button 
                  onClick={() => setViewType('monthly')}
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
                    viewType === 'monthly' ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"
                  )}
                >
                  Monthly
                </button>
                <button 
                  onClick={() => setViewType('yearly')}
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
                    viewType === 'yearly' ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"
                  )}
                >
                  Yearly
                </button>
              </div>
            </div>
            <div className="relative">
              <button 
                onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Calendar size={14} />
                <span>{selectedMonth}</span>
              </button>
              
              <AnimatePresence>
                {isMonthPickerOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden p-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">Month</p>
                        {months.map(m => (
                          <button
                            key={m}
                            onClick={() => onMonthChange(`${m} ${pickerYear}`)}
                            className={cn(
                              "w-full text-left px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50",
                              pickerMonth === m ? "text-blue-600 bg-blue-50" : "text-gray-600"
                            )}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                      <div className="space-y-1 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">Year</p>
                        {years.map(y => (
                          <button
                            key={y}
                            onClick={() => onMonthChange(`${pickerMonth} ${y}`)}
                            className={cn(
                              "w-full text-left px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50",
                              pickerYear === String(y) ? "text-blue-600 bg-blue-50" : "text-gray-600"
                            )}
                          >
                            {y}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsMonthPickerOpen(false)}
                      className="w-full mt-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200"
                    >
                      Done
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                {visibleLines.income && (
                  <Line 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#3B82F6" 
                    strokeWidth={4} 
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                )}
                {visibleLines.expenses && (
                  <Line 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="#E5E7EB" 
                    strokeWidth={4} 
                    dot={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex gap-6 mt-6">
            <button 
              onClick={() => toggleLine('income')}
              className={cn(
                "flex items-center gap-2 transition-all hover:opacity-80",
                !visibleLines.income && "opacity-40 grayscale"
              )}
            >
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm font-bold text-gray-600">Income</span>
            </button>
            <button 
              onClick={() => toggleLine('expenses')}
              className={cn(
                "flex items-center gap-2 transition-all hover:opacity-80",
                !visibleLines.expenses && "opacity-40 grayscale"
              )}
            >
              <div className="w-3 h-3 rounded-full bg-gray-300" />
              <span className="text-sm font-bold text-gray-600">Expenses</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mt-10">
          <div className="p-5 bg-white rounded-[28px] border border-emerald-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="flex items-center gap-2 text-emerald-500 mb-2 relative z-10">
              <ArrowUpRight size={18} strokeWidth={2.5} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Income</span>
            </div>
            <p className="text-xl font-display font-bold text-slate-900 relative z-10">{monthStats.income.toLocaleString()} Tk</p>
          </div>
          <div className="p-5 bg-white rounded-[28px] border border-pink-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-pink-50 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="flex items-center gap-2 text-pink-500 mb-2 relative z-10">
              <ArrowDownLeft size={18} strokeWidth={2.5} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Expenses</span>
            </div>
            <p className="text-xl font-display font-bold text-slate-900 relative z-10">{monthStats.expenses.toLocaleString()} Tk</p>
          </div>
        </div>

        {/* Budget Progress (Custom Categories) */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Budget Tracking</h3>
            <button 
              onClick={() => setIsBudgetModalOpen(true)}
              className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors flex items-center gap-1"
            >
              <Settings size={12} />
              Manage
            </button>
          </div>
          <div className="space-y-4">
            {budgets.length > 0 ? budgets.map((budget) => {
              const cat = EXPENSE_CATEGORIES.find(c => c.name === budget.category) || EXPENSE_CATEGORIES[0];
              const mIdx = months.indexOf(pickerMonth);
              const year = parseInt(pickerYear);
              const spent = Math.abs(transactions
                .filter(t => {
                  const parts = t.date.split(',')[0].split('-');
                  if (parts.length < 3) return false;
                  const [, mPart, yPart] = parts;
                  return t.category === budget.category && (parseInt(mPart) - 1) === mIdx && parseInt(yPart) === year;
                })
                .reduce((acc, curr) => acc + curr.amount, 0));
              const percent = Math.min((spent / budget.amount) * 100, 100);
              
              return (
                <div key={budget.category} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", cat.bg, cat.text)}>
                        {cat.icon}
                      </div>
                      <span className="font-bold text-slate-900 text-sm">{cat.name}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-400">{spent.toLocaleString()} / {budget.amount.toLocaleString()} Tk</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      className={cn(
                        "h-full rounded-full",
                        percent > 90 ? "bg-red-500" : percent > 70 ? "bg-amber-500" : "bg-indigo-500"
                      )}
                    />
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-8 bg-white rounded-[28px] border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm font-medium">No budgets set yet.</p>
                <button 
                  onClick={() => setIsBudgetModalOpen(true)}
                  className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
                >
                  Set your first budget
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Budget Manager Modal */}
        <AnimatePresence>
          {isBudgetModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsBudgetModalOpen(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
              >
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Manage Budgets</h3>
                  <button onClick={() => setIsBudgetModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                  {budgets.map((b, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", (EXPENSE_CATEGORIES.find(c => c.name === b.category) || EXPENSE_CATEGORIES[0]).bg, (EXPENSE_CATEGORIES.find(c => c.name === b.category) || EXPENSE_CATEGORIES[0]).text)}>
                            {(EXPENSE_CATEGORIES.find(c => c.name === b.category) || EXPENSE_CATEGORIES[0]).icon}
                          </div>
                          <select 
                            value={b.category}
                            onChange={(e) => {
                              const newBudgets = [...budgets];
                              newBudgets[idx].category = e.target.value;
                              onUpdateBudgets(newBudgets);
                            }}
                            className="bg-transparent font-bold text-slate-900 outline-none text-sm"
                          >
                            {EXPENSE_CATEGORIES.map(cat => (
                              <option key={cat.name} value={cat.name}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                        <button 
                          onClick={() => {
                            const newBudgets = budgets.filter((_, i) => i !== idx);
                            onUpdateBudgets(newBudgets);
                          }}
                          className="text-red-400 hover:text-red-600 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-400">Tk</span>
                        <input 
                          type="number"
                          value={b.amount}
                          onChange={(e) => {
                            const newBudgets = [...budgets];
                            newBudgets[idx].amount = Number(e.target.value);
                            onUpdateBudgets(newBudgets);
                          }}
                          className="flex-1 bg-white p-3 rounded-xl border border-slate-200 outline-none font-bold text-slate-900 text-base focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => {
                      onUpdateBudgets([...budgets, { category: EXPENSE_CATEGORIES[0].name, amount: 5000 }]);
                    }}
                    className="w-full py-5 border-2 border-dashed border-slate-200 rounded-[24px] text-slate-400 font-bold text-base hover:border-indigo-300 hover:text-indigo-500 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Add Budget Category
                  </button>
                </div>
                
                <div className="p-6 bg-slate-50 border-t border-slate-100">
                  <button 
                    onClick={() => setIsBudgetModalOpen(false)}
                    className="w-full py-4 premium-gradient text-white rounded-2xl font-bold shadow-lg shadow-indigo-200"
                  >
                    Save & Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Budget Progress */}
        {monthStats.income > 0 && (
          <div className="mt-6 p-6 bg-white rounded-[24px] border border-gray-100 shadow-sm">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Monthly Budget</h3>
                <p className="text-xs text-gray-500 mt-1">Based on your income</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">
                  {monthStats.expenses.toLocaleString()} / {monthStats.income.toLocaleString()} Tk
                </p>
              </div>
            </div>
            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-1000",
                  (monthStats.expenses / monthStats.income) > 0.9 ? "bg-red-500" :
                  (monthStats.expenses / monthStats.income) > 0.75 ? "bg-amber-500" :
                  "bg-blue-500"
                )}
                style={{ 
                  width: `${Math.min((monthStats.expenses / monthStats.income) * 100, 100)}%` 
                }}
              />
            </div>
            {(monthStats.expenses / monthStats.income) > 0.9 && (
              <p className="text-xs text-red-500 font-medium mt-3 flex items-center gap-1">
                <ArrowDownLeft size={12} />
                You are nearing your budget limit!
              </p>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-10">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => {
                setPendingTransactionType('income');
                setActiveTab('add');
              }}
              className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 hover:bg-emerald-100 transition-colors group"
            >
              <div className="p-2 bg-emerald-500 rounded-xl text-white group-hover:scale-110 transition-transform">
                <Plus size={18} />
              </div>
              <span className="font-bold text-emerald-700 text-sm">Add Income</span>
            </button>
            <button 
              onClick={() => {
                setPendingTransactionType('expense');
                setActiveTab('add');
              }}
              className="flex items-center gap-3 p-4 bg-pink-50 rounded-2xl border border-pink-100 hover:bg-pink-100 transition-colors group"
            >
              <div className="p-2 bg-pink-500 rounded-xl text-white group-hover:scale-110 transition-transform">
                <Minus size={18} />
              </div>
              <span className="font-bold text-pink-700 text-sm">Add Expense</span>
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mt-10 pb-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
            <button 
              onClick={() => onTabChange('history')}
              className="text-sm font-bold text-blue-600 hover:text-blue-700"
            >
              See All
            </button>
          </div>
          
          <div className="space-y-3">
            {transactions.length > 0 ? (
              transactions.slice(0, 5).map((tx) => {
                const isIncome = tx.amount > 0;
                const cats = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
                const catInfo = cats.find(c => c.name === tx.category) || cats[cats.length - 1];
                
                return (
                  <div 
                    key={tx.id}
                    className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", catInfo.bg, catInfo.text)}>
                        {catInfo.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{tx.category}</h4>
                        <p className="text-xs text-slate-400 font-medium">{tx.date.split(',')[0]}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn("font-bold text-sm", isIncome ? "text-emerald-500" : "text-pink-500")}>
                        {isIncome ? '+' : ''}{tx.amount.toLocaleString()} Tk
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium truncate max-w-[100px]">{tx.purpose}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <History size={24} className="text-slate-300" />
                </div>
                <p className="text-slate-400 font-medium text-sm">No transactions yet</p>
                <p className="text-slate-300 text-xs mt-1">Add your first income or expense</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ScreenWrapper>
  );
};

const CategorySummary = ({ 
  transactions, 
  onMenuClick, 
  selectedMonth,
  notifications,
  onMarkRead
}: { 
  transactions: typeof INITIAL_TRANSACTIONS; 
  onMenuClick: () => void;
  selectedMonth: string;
  notifications: any[];
  onMarkRead: () => void;
  key?: string;
}) => {
  const [summaryType, setSummaryType] = useState<'income' | 'expense'>('expense');

  const summaryData = useMemo(() => {
    const [pickerMonth, pickerYear] = selectedMonth.split(' ');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mIdx = months.indexOf(pickerMonth);
    const year = parseInt(pickerYear);

    const filteredTransactions = transactions.filter(t => {
      const parts = t.date.split(',')[0].split('-');
      if (parts.length < 3) return false;
      const [, mPart, yPart] = parts;
      const isCorrectMonth = (parseInt(mPart) - 1) === mIdx && parseInt(yPart) === year;
      const isCorrectType = summaryType === 'income' ? t.amount > 0 : t.amount < 0;
      return isCorrectMonth && isCorrectType;
    });
    const categoryTotals: { [key: string]: { name: string, value: number, color: string, icon: React.ReactNode, count: number } } = {};
    
    filteredTransactions.forEach(t => {
      if (!categoryTotals[t.category]) {
        categoryTotals[t.category] = { 
          name: t.category, 
          value: 0, 
          color: '#3B82F6',
          icon: t.icon,
          count: 0
        };
        
        const cats = summaryType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
        const catInfo = cats.find(c => c.name === t.category);
        if (catInfo) {
          categoryTotals[t.category].color = catInfo.text.includes('blue') ? '#3B82F6' : 
                                            catInfo.text.includes('emerald') ? '#10B981' :
                                            catInfo.text.includes('rose') ? '#F43F5E' :
                                            catInfo.text.includes('amber') ? '#F59E0B' :
                                            catInfo.text.includes('indigo') ? '#6366F1' :
                                            catInfo.text.includes('pink') ? '#EC4899' : '#94A3B8';
        }
      }
      categoryTotals[t.category].value += Math.abs(t.amount);
      categoryTotals[t.category].count += 1;
    });
    
    return Object.values(categoryTotals).sort((a, b) => b.value - a.value);
  }, [transactions, summaryType]);

  const total = useMemo(() => summaryData.reduce((acc, curr) => acc + curr.value, 0), [summaryData]);

  return (
    <ScreenWrapper>
      <Header 
        title="Category summary" 
        onMenuClick={onMenuClick} 
        notifications={notifications}
        onMarkRead={onMarkRead}
      />
      
      <div className="px-6">
        <div className="flex gap-2 mb-6">
          <button 
            onClick={() => setSummaryType('expense')}
            className={cn(
              "flex-1 py-4 rounded-2xl font-bold transition-all",
              summaryType === 'expense' ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
            )}
          >
            Expenses
          </button>
          <button 
            onClick={() => setSummaryType('income')}
            className={cn(
              "flex-1 py-4 rounded-2xl font-bold transition-all",
              summaryType === 'income' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
            )}
          >
            Income
          </button>
        </div>

        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-display font-bold text-slate-900">Summary</h3>
            <div className="px-4 py-1.5 bg-slate-50 rounded-full text-xs font-bold text-slate-500 border border-slate-100">
              {selectedMonth}
            </div>
          </div>

          <div className="h-[280px] w-full relative">
            {summaryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={summaryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={8}
                    >
                      {summaryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Amount</p>
                  {(() => {
                    const amountText = `Tk ${total.toLocaleString()}`;
                    return (
                      <p className="text-xl font-display font-bold text-slate-900 mt-0.5 px-2">
                        {amountText}
                      </p>
                    );
                  })()}
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-2">
                  <PieChartIcon size={32} />
                </div>
                <p className="text-slate-400 font-bold text-sm">No data for this month</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 space-y-4">
          <h3 className="text-lg font-display font-bold text-slate-900 mb-4">Categories</h3>
          {summaryData.length > 0 ? (
            summaryData.map((cat, idx) => (
              <motion.div 
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={cat.name} 
                className="flex items-center justify-between p-4 bg-white rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-[20px] flex items-center justify-center text-white shadow-md"
                    style={{ backgroundColor: cat.color }}
                  >
                    {cat.icon}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{cat.name}</p>
                    <p className="text-xs text-slate-400 font-medium">{cat.count} transactions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-slate-900 text-lg">{cat.value.toFixed(2)} Tk</p>
                  <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider bg-indigo-50 inline-block px-2 py-0.5 rounded-md mt-1">{( (cat.value / total) * 100 ).toFixed(1)}%</p>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-slate-400 py-10 font-medium">No categories to show</p>
          )}
        </div>
      </div>
    </ScreenWrapper>
  );
};

const Transactions = ({ 
  transactions, 
  onMenuClick, 
  searchQuery,
  onSearchChange,
  onDelete,
  notifications,
  onMarkRead
}: { 
  transactions: typeof INITIAL_TRANSACTIONS; 
  onMenuClick: () => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onDelete: (id: string | number) => void;
  notifications: any[];
  onMarkRead: () => void;
  key?: string;
}) => {
  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    
    const headers = ['ID', 'Date', 'Type', 'Category', 'Amount', 'Note'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        t.id,
        t.date,
        t.amount > 0 ? 'Income' : 'Expense',
        `"${t.category}"`,
        t.amount,
        `"${t.purpose || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ScreenWrapper>
      <Header 
        title="View Transactions" 
        onMenuClick={onMenuClick} 
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        notifications={notifications}
        onMarkRead={onMarkRead}
      />
      
      <div className="px-6">
        <div className="flex justify-end mb-4">
          <button
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
        <div className="space-y-3">
          {transactions.length > 0 ? (
            transactions.map((tx, idx) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={tx.id} 
                className="flex items-center justify-between p-4 bg-white rounded-[24px] border border-slate-100 hover:border-indigo-100 transition-all group cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-[20px] flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm", tx.color || "bg-slate-100 text-slate-400")}>
                    {tx.icon ? React.cloneElement(tx.icon as React.ReactElement, { size: 20 }) : <ShoppingBag size={20} />}
                  </div>
                  <div className="flex flex-col">
                    <p className="font-bold text-slate-900 leading-tight tracking-tight">
                      {tx.purpose || tx.category}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {tx.purpose && (
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-md">
                          {tx.category}
                        </span>
                      )}
                      <p className="text-[10px] text-slate-400 font-medium">{tx.date}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className={cn("font-display font-bold tracking-tight text-lg", tx.amount > 0 ? "text-emerald-500" : "text-slate-900")}>
                    {tx.amount > 0 ? "+" : ""}{tx.amount.toFixed(2)} Tk
                  </p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(tx.id); }}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 bg-red-50 rounded-full hover:bg-red-100"
                  >
                    <Trash2 size={16} />
                  </button>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                <Search size={32} />
              </div>
              <p className="text-gray-400 font-bold">No transactions found</p>
              <p className="text-xs text-gray-300 mt-1">Try a different search term or month</p>
            </div>
          )}
        </div>
      </div>
    </ScreenWrapper>
  );
};

const AddTransaction = ({ onAdd, onCancel, initialType }: { onAdd: (tx: any) => void; onCancel: () => void; initialType?: 'expense' | 'income' | null; key?: string }) => {
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [type, setType] = useState<'expense' | 'income'>(initialType || 'expense');
  const [category, setCategory] = useState(initialType === 'income' ? 'Hospital Salary' : 'Food & Grocery');
  const [searchCat, setSearchCat] = useState('');
  const [isCatOpen, setIsCatOpen] = useState(false);

  // Reset category when type changes
  useEffect(() => {
    if (type === 'income') {
      setCategory('Hospital Salary');
    } else {
      setCategory('Food & Grocery');
    }
  }, [type]);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const filteredCats = categories.filter(c => c.name.toLowerCase().includes(searchCat.toLowerCase()));
  const selectedCat = categories.find(c => c.name === category) || categories[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    const isIncome = type === 'income';
    const amountVal = parseFloat(amount);
    
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const dateStr = `${day}-${month}-${year}, ${hours}:${minutes}`;

    const newTx = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      category: category,
      purpose: purpose || (isIncome ? 'Income' : 'Expense'),
      date: dateStr,
      amount: isIncome ? amountVal : -amountVal,
      icon: selectedCat.icon,
      color: `${selectedCat.bg} ${selectedCat.text}`
    };
    onAdd(newTx);
  };

  return (
    <ScreenWrapper>
      <div className="px-6 pt-8 pb-20">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onCancel} className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
            <X size={20} className="text-slate-600" />
          </button>
          <h2 className="text-xl font-display font-bold text-slate-900">Add Transaction</h2>
          <div className="w-10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex bg-slate-100/50 p-1 rounded-2xl backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={cn(
                "flex-1 py-3 rounded-xl font-bold text-sm transition-all",
                type === 'expense' ? "bg-white text-pink-500 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={cn(
                "flex-1 py-3 rounded-xl font-bold text-sm transition-all",
                type === 'income' ? "bg-white text-emerald-500 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Income
            </button>
          </div>

          <div className="text-center py-10">
            <p className="text-sm text-slate-400 font-bold mb-4 uppercase tracking-widest">Enter Amount</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-5xl font-display font-bold text-slate-300">Tk</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="text-6xl font-display font-bold text-slate-900 bg-transparent outline-none w-full max-w-[320px] text-center placeholder:text-slate-200"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
              {type === 'income' ? 'Source of Income' : 'Purpose / Note'}
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder={type === 'income' ? 'e.g. Office, Freelance' : 'What is this for?'}
              className="w-full p-6 bg-white rounded-[28px] border border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-lg text-slate-900 transition-all shadow-sm"
            />
          </div>

          <div className="space-y-2 relative">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Select Category</label>
            <button
              type="button"
              onClick={() => setIsCatOpen(!isCatOpen)}
              className="w-full flex items-center justify-between p-6 bg-white rounded-[28px] border border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-900 transition-all shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", selectedCat.bg, selectedCat.text)}>
                  {selectedCat.icon}
                </div>
                <span className="text-xl">{selectedCat.name}</span>
              </div>
              <ChevronRight size={24} className={cn("text-slate-400 transition-transform", isCatOpen ? "rotate-90" : "")} />
            </button>

            <AnimatePresence>
              {isCatOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden flex flex-col max-h-[400px]"
                >
                  <div className="p-3 border-b border-gray-50 flex items-center gap-2">
                    <Search size={16} className="text-gray-400" />
                    <input
                      type="text"
                      value={searchCat}
                      onChange={(e) => setSearchCat(e.target.value)}
                      placeholder="Search categories..."
                      className="flex-1 text-sm font-medium outline-none bg-transparent"
                    />
                  </div>
                  <div className="overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {filteredCats.length > 0 ? (
                      filteredCats.map((cat) => (
                        <button
                          key={cat.name}
                          type="button"
                          onClick={() => {
                            setCategory(cat.name);
                            setIsCatOpen(false);
                            setSearchCat('');
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-gray-50",
                            category === cat.name ? "bg-blue-50 text-blue-600" : "text-gray-700"
                          )}
                        >
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", cat.bg, cat.text)}>
                            {cat.icon}
                          </div>
                          <span className="font-bold text-sm">{cat.name}</span>
                          {category === cat.name && <Check size={16} className="ml-auto" />}
                        </button>
                      ))
                    ) : (
                      <p className="text-center py-4 text-sm text-gray-400 font-medium">No categories found.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            className="w-full py-5 premium-gradient text-white rounded-[24px] font-bold text-lg shadow-xl shadow-indigo-500/20 hover:opacity-90 transition-opacity"
          >
            Save Transaction
          </button>
        </form>
      </div>
    </ScreenWrapper>
  );
};

const Profile = ({ profile, onUpdate, googleTokens, setGoogleTokens, showToast }: { profile: any; onUpdate: (p: any) => void; googleTokens: any; setGoogleTokens: (t: any) => void; showToast: any; key?: string }) => {
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(profile.name);
    setAvatar(profile.avatar);
  }, [profile]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        if (googleTokens) {
          setIsUploading(true);
          showToast('Uploading to Google Drive...', 'info');
          try {
            const res = await fetch('/api/upload-to-drive', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                base64Image: base64, 
                fileName: `profile_${Date.now()}.jpg`,
                tokens: googleTokens 
              })
            });
            const data = await res.json();
            if (data.success) {
              setAvatar(data.directLink);
              if (data.tokens) {
                setGoogleTokens(data.tokens);
              }
              showToast('Profile picture saved to Drive!', 'success');
              // Automatically update the profile with the new avatar link
              onUpdate({ avatar: data.directLink });
            } else {
              throw new Error(data.error);
            }
          } catch (e) {
            console.error('Drive upload failed', e);
            showToast('Failed to upload to Drive. Saving locally.', 'error');
            setAvatar(base64);
          } finally {
            setIsUploading(false);
          }
        } else {
          setAvatar(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <ScreenWrapper>
      <div className="px-6 pt-8 pb-20">
        <h2 className="text-2xl font-display font-bold text-slate-900 mb-10">My Profile</h2>

        <div className="flex flex-col items-center mb-10">
          <div className="relative group">
            <div className={cn(
              "w-32 h-32 rounded-full overflow-hidden shadow-xl bg-slate-100 flex items-center justify-center transition-all",
              isUploading && "opacity-50 grayscale"
            )}>
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <UserIcon size={48} className="text-slate-300" />
              )}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute bottom-0 right-0 w-10 h-10 premium-gradient rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
            >
              <Camera size={16} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              className="hidden" 
              accept="image/*"
            />
          </div>
          <div className="flex flex-col items-center mt-4">
            <p className="text-sm text-slate-400 font-medium">{isUploading ? 'Uploading...' : 'Tap to change photo'}</p>
            {avatar && !isUploading && (
              <button 
                onClick={() => setAvatar(null)}
                className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-wider hover:text-red-600 bg-red-50 px-3 py-1 rounded-full"
              >
                Remove Photo
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-6 bg-white rounded-[28px] border border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-lg text-slate-900 transition-all shadow-sm"
            />
          </div>

          <div className="p-6 bg-indigo-50 rounded-[32px] border border-indigo-100/50">
            <h4 className="text-sm font-bold text-indigo-600 mb-4 uppercase tracking-wider">Account Settings</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium text-sm">Currency</span>
                <span className="font-bold text-slate-900 bg-white px-3 py-1 rounded-lg text-sm shadow-sm">BD (TK)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium text-sm">Language</span>
                <span className="font-bold text-slate-900 bg-white px-3 py-1 rounded-lg text-sm shadow-sm">English</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onUpdate({ name, avatar })}
            disabled={isUploading}
            className="w-full py-5 premium-gradient text-white rounded-[24px] font-bold text-lg shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Check size={20} />
            Save Changes
          </button>
        </div>
      </div>
    </ScreenWrapper>
  );
};

const LoginScreen = ({ onLogin }: { onLogin: (name: string, email: string, pass: string) => void }) => {
  const [method, setMethod] = useState<'initial' | 'gmail' | 'phone'>('gmail');
  const [value, setValue] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (value === 'rajuhd13@gmail.com' && password === 'Raju@2348') {
      setError('');
      const derivedName = 'Raju';
      onLogin(derivedName, value, password);
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 relative overflow-y-auto py-4">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-600/30 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="flex-1 flex flex-col justify-center px-8 z-10 max-w-md mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-6 text-center"
        >
          <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto mb-4 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-2xl">
            <Wallet size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-display font-bold text-white mb-2 tracking-tight">Financier</h1>
          <p className="text-slate-300 font-medium text-base">Master your wealth with elegance.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-panel-dark rounded-[28px] p-6 shadow-2xl"
        >
          <AnimatePresence mode="wait">
            {method === 'initial' ? (
              <motion.div 
                key="initial"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <button 
                  onClick={() => setMethod('gmail')}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-white/10 rounded-[20px] border border-white/10 font-bold text-white hover:bg-white/20 transition-all"
                >
                  <Mail className="text-pink-400" />
                  Continue with Email
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value);
                      setError('');
                    }}
                    placeholder="yourname@gmail.com"
                    className="w-full p-6 bg-white/5 rounded-[28px] border border-white/10 focus:border-indigo-500 focus:bg-white/10 outline-none font-bold text-lg text-white transition-all placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="••••••••"
                    className="w-full p-6 bg-white/5 rounded-[28px] border border-white/10 focus:border-indigo-500 focus:bg-white/10 outline-none font-bold text-lg text-white transition-all placeholder:text-slate-500"
                  />
                </div>
                {error && (
                  <p className="text-pink-400 text-sm font-medium text-center">{error}</p>
                )}
                <button 
                  onClick={handleLogin}
                  className="w-full py-5 premium-gradient text-white rounded-[28px] font-bold text-xl shadow-xl shadow-indigo-500/20 hover:opacity-90 transition-opacity"
                >
                  Sign In
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-slate-400 font-medium">By continuing, you agree to our <span className="text-indigo-400 cursor-pointer">Terms</span> and <span className="text-indigo-400 cursor-pointer">Privacy Policy</span>.</p>
        </motion.div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('financier_is_logged_in') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('financier_is_logged_in', isLoggedIn ? 'true' : 'false');
  }, [isLoggedIn]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'summary' | 'history' | 'profile' | 'add'>('dashboard');
  const [pendingTransactionType, setPendingTransactionType] = useState<'expense' | 'income' | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('financier_budgets');
    return saved ? JSON.parse(saved) : [
      { category: 'Food & Grocery', amount: 15000 },
      { category: 'Shopping', amount: 10000 },
      { category: 'Health & Medical', amount: 5000 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('financier_budgets', JSON.stringify(budgets));
  }, [budgets]);

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('financier_transactions');
    const initial = saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    // Enrich with icons/colors (React elements aren't stored in JSON)
    const seenIds = new Set();
    return initial.map((tx: any) => {
      const isIncome = tx.amount > 0;
      const cats = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
      const catInfo = cats.find(c => c.name === tx.category) || cats[cats.length - 1];
      
      let id = tx.id || Math.random().toString(36).substr(2, 9);
      if (seenIds.has(id)) {
        id = `${id}-${Math.random().toString(36).substr(2, 4)}`;
      }
      seenIds.add(id);

      return {
        ...tx,
        id,
        icon: catInfo.icon,
        color: `${catInfo.bg} ${catInfo.text}`
      };
    });
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear());
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('financier_profile');
    return saved ? JSON.parse(saved) : {
      name: 'John Doe',
      email: '',
      avatar: null as string | null
    };
  });

  useEffect(() => {
    localStorage.setItem('financier_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('financier_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const monthMap: { [key: string]: string } = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
      'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    const [monthName, year] = selectedMonth.split(' ');
    const monthNum = monthMap[monthName];

    return transactions.filter(t => {
      const matchesSearch = (t.purpose || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (t.category || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      // Date format: DD-MM-YYYY
      const matchesMonth = t.date.includes(`-${monthNum}-${year}`); 
      return matchesSearch && matchesMonth;
    });
  }, [transactions, searchQuery, selectedMonth]);

  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [googleTokens, setGoogleTokens] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [notifications, setNotifications] = useState<any[]>(() => {
    const saved = localStorage.getItem('financier_notifications');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'Welcome!', message: 'Start tracking your finances today.', time: 'Just now', read: false, type: 'info' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('financier_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (title: string, message: string, type: 'success' | 'alert' | 'info' = 'info') => {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      message,
      time: 'Just now',
      read: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 20));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const savedTokens = localStorage.getItem('googleTokens');
      if (savedTokens) {
        try {
          const tokens = JSON.parse(savedTokens);
          setGoogleTokens(tokens);
          setIsGoogleConnected(true);
          if (isLoggedIn) {
            setTimeout(() => {
              handleSyncFromSheet(tokens);
              handleSyncProfile(tokens);
            }, 1000);
          }
        } catch (e) {
          console.error('Failed to parse saved tokens', e);
          localStorage.removeItem('googleTokens');
        }
      } else {
        try {
          const res = await fetch('/api/auth/status');
          const data = await res.json();
          if (data.connected) {
            setIsGoogleConnected(true);
            if (isLoggedIn) {
              setTimeout(() => {
                handleSyncFromSheet();
                handleSyncProfile();
              }, 1000);
            }
          }
        } catch (e) {
          console.error('Failed to check auth status', e);
        }
      }
    };
    checkAuthStatus();
  }, [isLoggedIn]);

  const showToast = (text: string, type: 'success' | 'error' | 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleConnectGoogle = async () => {
    try {
      const res = await fetch('/api/auth/google/url');
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.error === 'MISSING_CREDENTIALS') {
          showToast('Google Client ID/Secret missing in Settings.', 'error');
        } else {
          showToast(`Server error: ${data.message || res.statusText}`, 'error');
        }
        return;
      }

      const data = await res.json();
      const { url } = data;
      const authWindow = window.open(url, 'google_oauth', 'width=600,height=700');
      
      if (!authWindow) {
        showToast('Popup blocked! Please allow popups for this site.', 'error');
        return;
      }

      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
          const tokens = event.data.tokens;
          setGoogleTokens(tokens);
          setIsGoogleConnected(true);
          localStorage.setItem('googleTokens', JSON.stringify(tokens));
          showToast('Successfully connected to Google Sheets!', 'success');
          window.removeEventListener('message', handleMessage);
        }
      };
      window.addEventListener('message', handleMessage);
    } catch (e: any) {
      console.error('Failed to connect Google', e);
      showToast(`Connection failed: ${e.message || 'Network error'}`, 'error');
    }
  };

  const handleAddTransaction = async (newTx: any) => {
    const txWithId = { ...newTx, id: Math.random().toString(36).substr(2, 9) };
    const originalTransactions = [...transactions];
    setTransactions([txWithId, ...transactions]);
    setActiveTab('dashboard');

    if (isGoogleConnected) {
      setIsSyncing(true);
      // Optimistic update - don't wait for sync
      fetch('/api/sync-to-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          transaction: txWithId,
          tokens: googleTokens 
        })
      }).then(async (response) => {
        setIsSyncing(false);
        if (!response.ok) {
          const errData = await response.json();
          setTransactions(originalTransactions);
          showToast(`Sync failed: ${errData.error || 'Unknown error'}`, 'error');
          addNotification('Sync Failed', 'Could not sync transaction to Google Sheets.', 'alert');
        } else {
          showToast('Successfully synced to Google Sheets!', 'success');
          addNotification('Sync Successful', `Transaction "${txWithId.category}" synced to Sheets.`, 'success');
        }
      }).catch(e => {
        setIsSyncing(false);
        console.error('Failed to sync to Google Sheets', e);
        setTransactions(originalTransactions);
        showToast('Error connecting to server for sync.', 'error');
        addNotification('Sync Error', 'Network error while syncing to Sheets.', 'alert');
      });
    } else {
      showToast('Transaction saved locally. Connect Google Sheets to sync.', 'info');
    }
  };

  const handleDeleteTransaction = async (id: string | number) => {
    const originalTransactions = [...transactions];
    const txToDelete = transactions.find(t => t.id === id);
    setTransactions(transactions.filter(t => t.id !== id));
    
    if (isGoogleConnected && txToDelete?.id) {
      setIsSyncing(true);
      // Optimistic update - don't wait for sync
      fetch('/api/delete-from-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          transactionId: id,
          tokens: googleTokens 
        })
      }).then(async (response) => {
        setIsSyncing(false);
        if (!response.ok) {
          setTransactions(originalTransactions);
          showToast('Failed to delete from Sheets. It might already be gone.', 'error');
          addNotification('Delete Failed', 'Could not delete transaction from Google Sheets.', 'alert');
        } else {
          showToast('Deleted from Google Sheets!', 'success');
          addNotification('Delete Successful', 'Transaction removed from Google Sheets.', 'success');
        }
      }).catch(e => {
        setIsSyncing(false);
        console.error('Failed to delete from sheet', e);
        setTransactions(originalTransactions);
        showToast('Error connecting to server for sync.', 'error');
        addNotification('Delete Error', 'Network error while deleting from Sheets.', 'alert');
      });
    }
  };

  const handleSyncProfile = async (manualTokens?: any) => {
    const tokensToUse = manualTokens || googleTokens;
    if (!tokensToUse || !profile.email) return;
    
    try {
      const response = await fetch('/api/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: profile.email, 
          password: 'Raju@2348', // Using the master password
          tokens: tokensToUse 
        })
      });
      const data = await response.json();
      if (data.success && data.profile) {
        setProfile({
          name: data.profile.name || profile.name,
          email: profile.email,
          avatar: data.profile.avatar || null
        });
      }
    } catch (e) {
      console.error('Failed to sync profile', e);
    }
  };

  const handleSyncFromSheet = async (manualTokens?: any) => {
    const tokensToUse = manualTokens || googleTokens;
    
    setIsSyncing(true);
    showToast('Fetching latest data from Sheets...', 'info');
    try {
      const response = await fetch('/api/fetch-from-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokens: tokensToUse })
      });
      
      setIsSyncing(false);
      if (!response.ok) {
        let errText = await response.text();
        try {
          const errJson = JSON.parse(errText);
          errText = errJson.error || errText;
        } catch (e) {}
        throw new Error(`Server error: ${response.status} ${errText}`);
      }

      const data = await response.json();
      if (data.transactions) {
        // Enrich transactions with icons and colors
        const seenIds = new Set();
        const enriched = data.transactions.map((tx: any) => {
          const isIncome = tx.amount > 0;
          const cats = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
          const catInfo = cats.find(c => c.name === tx.category) || cats[cats.length - 1];
          
          let id = tx.id || Math.random().toString(36).substr(2, 9);
          if (seenIds.has(id)) {
            id = `${id}-${Math.random().toString(36).substr(2, 4)}`;
          }
          seenIds.add(id);

          return {
            ...tx,
            id,
            icon: catInfo.icon,
            color: `${catInfo.bg} ${catInfo.text}`
          };
        });
        setTransactions(enriched);
        showToast('App synced with Google Sheets!', 'success');
        addNotification('Sync Successful', 'Data successfully fetched from Google Sheets.', 'success');
      }
    } catch (e: any) {
      setIsSyncing(false);
      console.error('Failed to fetch from sheet', e);
      showToast(`Failed to sync: ${e.message}`, 'error');
      addNotification('Sync Failed', `Error: ${e.message}`, 'alert');
    }
  };

  const handleLogout = () => {
    setTransactions([]);
    setActiveTab('dashboard');
    setSearchQuery('');
    setSelectedMonth(getCurrentMonthYear());
    setIsLoggedIn(false);
    // We keep googleTokens in localStorage so it reconnects automatically on next login
    // We also keep profile in localStorage so name and avatar persist
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row relative overflow-x-hidden font-sans">
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between gap-3 text-sm font-bold",
              toastMessage.type === 'success' ? "bg-emerald-600 text-white" : 
              toastMessage.type === 'error' ? "bg-red-600 text-white" : 
              "bg-gray-900 text-white"
            )}
          >
            <span>{toastMessage.text}</span>
            <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
              <X size={16} />
            </button>
          </motion.div>
        </div>
      )}

      {!isLoggedIn ? (
        <div className="w-full max-w-md mx-auto min-h-screen flex flex-col">
          <LoginScreen onLogin={async (name, email, pass) => {
            if (pass !== 'Raju@2348') {
              showToast('Invalid password. Please try again.', 'error');
              return;
            }
            
            setIsLoggedIn(true);

            // Give it a moment to settle
            setTimeout(() => {
              handleSyncFromSheet();
            }, 500);

            // Sync user to Google Sheets and get their profile
            try {
              const response = await fetch('/api/sync-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  email, 
                  password: pass, 
                  name: profile.name === 'John Doe' ? name : profile.name,
                  avatar: profile.avatar
                })
              });
              const data = await response.json();
              if (data.success && data.profile) {
                setProfile({
                  name: data.profile.name || name,
                  email: email,
                  avatar: data.profile.avatar || null
                });
              } else {
                setProfile(p => ({ ...p, name: p.name === 'John Doe' ? name : p.name, email }));
              }
            } catch (e) {
              console.error('Failed to sync user to sheet', e);
              setProfile(p => ({ ...p, name: p.name === 'John Doe' ? name : p.name, email }));
            }
          }} />
        </div>
      ) : (
        <>
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
            profile={profile}
            onTabChange={(tab) => setActiveTab(tab)}
            onLogout={handleLogout}
            activeTab={activeTab}
            isGoogleConnected={isGoogleConnected}
            onConnectGoogle={handleConnectGoogle}
            onSync={handleSyncFromSheet}
          />
          
          <div className="flex-1 flex flex-col relative min-h-screen lg:max-w-5xl lg:mx-auto w-full">

            <div className="flex-1 relative overflow-hidden pb-12">
              <AnimatePresence mode="wait">
                {activeTab === 'dashboard' && (
                  <Dashboard 
                    key="dashboard" 
                    transactions={filteredTransactions} 
                    onMenuClick={toggleSidebar}
                    selectedMonth={selectedMonth}
                    onMonthChange={setSelectedMonth}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onTabChange={setActiveTab}
                    notifications={notifications}
                    onMarkRead={markAllNotificationsRead}
                    isSyncing={isSyncing}
                    budgets={budgets}
                    onUpdateBudgets={setBudgets}
                    profile={profile}
                    setPendingTransactionType={setPendingTransactionType}
                    setActiveTab={setActiveTab}
                  />
                )}
                {activeTab === 'summary' && (
                  <CategorySummary 
                    key="summary" 
                    transactions={filteredTransactions} 
                    onMenuClick={toggleSidebar} 
                    selectedMonth={selectedMonth}
                    notifications={notifications}
                    onMarkRead={markAllNotificationsRead}
                  />
                )}
                {activeTab === 'history' && (
                  <Transactions 
                    key="history" 
                    transactions={filteredTransactions} 
                    onMenuClick={toggleSidebar}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onDelete={handleDeleteTransaction}
                    notifications={notifications}
                    onMarkRead={markAllNotificationsRead}
                  />
                )}
                {activeTab === 'profile' && (
                  <Profile 
                    profile={profile} 
                    onUpdate={async (p) => { 
                      const updatedProfile = { ...profile, ...p };
                      setProfile(updatedProfile); 
                      setActiveTab('dashboard'); 

                      // Sync profile to Google Sheets
                      if (isGoogleConnected) {
                        try {
                          const res = await fetch('/api/update-profile', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                              email: profile.email,
                              name: updatedProfile.name,
                              avatar: updatedProfile.avatar,
                              tokens: googleTokens 
                            })
                          });
                          if (res.ok) {
                            showToast('Profile updated permanently!', 'success');
                          } else {
                            showToast('Saved locally, but failed to sync with Sheets.', 'info');
                          }
                        } catch (e) {
                          console.error('Failed to update profile on sheet', e);
                          showToast('Saved locally, but failed to sync with Sheets.', 'info');
                        }
                      } else {
                        showToast('Profile saved locally!', 'success');
                      }
                    }} 
                    googleTokens={googleTokens} 
                    setGoogleTokens={setGoogleTokens}
                    showToast={showToast} 
                  />
                )}
                {activeTab === 'add' && <AddTransaction key="add" onAdd={handleAddTransaction} onCancel={() => { setActiveTab('dashboard'); setPendingTransactionType(null); }} initialType={pendingTransactionType} />}
              </AnimatePresence>
            </div>

            {/* Floating Action Button */}
            {activeTab !== 'profile' && activeTab !== 'add' && (
              <div className="fixed bottom-12 left-1/2 lg:left-auto lg:right-12 -translate-x-1/2 lg:translate-x-0 z-50">
                <button 
                  onClick={() => setActiveTab('add')}
                  className="w-16 h-16 premium-gradient text-white rounded-full flex items-center justify-center shadow-xl shadow-indigo-500/30 hover:scale-110 active:scale-95 transition-transform"
                >
                  <Plus size={32} />
                </button>
              </div>
            )}

          </div>
        </>
      )}
    </div>
  );
}
