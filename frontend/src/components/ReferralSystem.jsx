import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Share2, Gift, Users } from 'lucide-react';
import { getCurrentUser, getReferralLink, claimReferralBonus } from '../mock';

const ReferralSystem = ({ onBalanceChange }) => {
  const [referralBonus, setReferralBonus] = useState(0);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const user = getCurrentUser();

  const handleCopyReferralLink = () => {
    if (!user) {
      setMessage('Please log in to use referral system');
      setMessageType('error');
      return;
    }

    const referralLink = getReferralLink(user.id);
    navigator.clipboard.writeText(referralLink);
    
    setMessage('Referral link copied to clipboard! Share it with your friends.');
    setMessageType('success');
    
    // Simulate bonus for demonstration
    if (referralBonus === 0) {
      setReferralBonus(500); // Rs. 500 bonus for sharing (updated from Rs. 50)
    }
  };

  const handleClaimBonus = () => {
    if (!user) {
      setMessage('Please log in to claim bonus');
      setMessageType('error');
      return;
    }

    if (referralBonus > 0) {
      // In a real implementation, this would call the backend API
      const result = claimReferralBonus(user.id, 'demo_referred_user');
      
      if (result.success) {
        setMessage(result.message);
        setMessageType('success');
        setReferralBonus(0);
        
        // Notify parent component of balance change
        if (onBalanceChange) {
          onBalanceChange();
        }
      } else {
        setMessage(result.message);
        setMessageType('error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="w-8 h-8 text-indigo-400" />
        <h2 className="text-3xl font-bold text-white">Referral Program</h2>
      </div>

      {message && (
        <div className={`p-3 rounded-lg ${
          messageType === 'success' 
            ? 'bg-green-900/50 border border-green-500/30 text-green-300' 
            : 'bg-red-900/50 border border-red-500/30 text-red-300'
        }`}>
          {message}
        </div>
      )}

      {/* Referral Bonus Section */}
      <Card className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-indigo-500/30 p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Refer & Earn</h3>
              <p className="text-gray-300">
                Share your referral link and earn Rs. 500 for each friend who registers!
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCopyReferralLink}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
            {referralBonus > 0 && (
              <Button
                onClick={handleClaimBonus}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                Claim Rs. {referralBonus}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* How it works */}
      <Card className="bg-gray-800/50 border-gray-700 p-6">
        <h3 className="text-xl font-bold text-white mb-4">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-indigo-400 mb-2">1</div>
            <h4 className="font-bold text-white mb-2">Share Your Link</h4>
            <p className="text-gray-400 text-sm">
              Copy your referral link and share it with friends and family.
            </p>
          </div>
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-indigo-400 mb-2">2</div>
            <h4 className="font-bold text-white mb-2">They Register</h4>
            <p className="text-gray-400 text-sm">
              Your friends register using your referral link.
            </p>
          </div>
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-indigo-400 mb-2">3</div>
            <h4 className="font-bold text-white mb-2">You Earn</h4>
            <p className="text-gray-400 text-sm">
              You get Rs. 500 bonus for each successful referral.
            </p>
          </div>
        </div>
      </Card>

      {/* Terms and conditions */}
      <Card className="bg-gray-800/50 border-gray-700 p-6">
        <h3 className="text-xl font-bold text-white mb-4">Terms & Conditions</h3>
        <ul className="text-gray-400 space-y-2">
          <li className="flex items-start">
            <span className="text-indigo-400 mr-2">•</span>
            <span>Each successful referral earns you Rs. 500</span>
          </li>
          <li className="flex items-start">
            <span className="text-indigo-400 mr-2">•</span>
            <span>Referral bonus is credited after the referred user completes registration</span>
          </li>
          <li className="flex items-start">
            <span className="text-indigo-400 mr-2">•</span>
            <span>No limit on the number of referrals you can make</span>
          </li>
          <li className="flex items-start">
            <span className="text-indigo-400 mr-2">•</span>
            <span>WinShow reserves the right to modify or terminate the referral program at any time</span>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default ReferralSystem;