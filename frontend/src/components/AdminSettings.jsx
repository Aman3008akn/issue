import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Settings } from 'lucide-react';

const AdminSettings = () => {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedNumber = localStorage.getItem('whatsappNumber');
    if (savedNumber) setWhatsappNumber(savedNumber);
  }, []);

  const handleUpdateWhatsAppNumber = (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!whatsappNumber.trim()) {
      setWhatsappMessage('Please enter a WhatsApp number');
      setIsLoading(false);
      return;
    }

    if (!/^\d+$/.test(whatsappNumber.trim())) {
      setWhatsappMessage('Please enter a valid WhatsApp number (digits only)');
      setIsLoading(false);
      return;
    }

    localStorage.setItem('whatsappNumber', whatsappNumber.trim());
    setWhatsappMessage('WhatsApp number updated successfully');
    setTimeout(() => setWhatsappMessage(''), 3000);
    setIsLoading(false);
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700 p-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5 text-purple-400" />
        Settings
      </h3>

      <form onSubmit={handleUpdateWhatsAppNumber} className="space-y-4">
        <div>
          <label className="text-gray-400 text-sm mb-2 block">
            WhatsApp Support Number
          </label>
          <Input
            type="text"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
            placeholder="Enter WhatsApp number"
            disabled={isLoading}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          disabled={isLoading}
        >
          {isLoading ? 'Updating...' : 'Update Number'}
        </Button>

        {whatsappMessage && (
          <div className="text-sm text-green-400 text-center">
            {whatsappMessage}
          </div>
        )}
      </form>
    </Card>
  );
};

export default AdminSettings;
