'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MenuItem {
  title: string;
}

export default function Lunch() {
  const [todayMenu, setTodayMenu] = useState<string[]>([]);
  const [tomorrowMenu, setTomorrowMenu] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const url = "https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fbrrice.tandem.co%2Findex.php%3Ftype%3Dexport%26action%3Drss%26export_type%3Dmenus";
        const response = await fetch(url);
        const jsonData = await response.json();

        if (jsonData.items && Array.isArray(jsonData.items)) {
          const today = new Date();
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);

          const todayItems = getMenuItems(jsonData.items, today);
          const tomorrowItems = getMenuItems(jsonData.items, tomorrow);

          setTodayMenu(todayItems);
          setTomorrowMenu(tomorrowItems);
        } else {
          setTodayMenu(['No menu items found.']);
          setTomorrowMenu(['No menu items found.']);
        }
      } catch (error) {
        console.error('Error fetching menu:', error);
        setTodayMenu(['There is no school today.']);
        setTomorrowMenu(['There is no school tomorrow.']);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const getMenuItems = (items: MenuItem[], date: Date): string[] => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = dayNames[date.getDay()];
    const month = date.getMonth() + 1;
    const dayOfMonth = date.getDate();
    const formattedDate = `${day} ${month}-${dayOfMonth}`;

    const matchingItems: string[] = [];

    items.forEach(item => {
      const regex = new RegExp('^' + formattedDate + '\\s');
      if (item.title && regex.test(item.title)) {
        const titleWithoutDate = item.title.replace(regex, '').replace(/&/g, '&');
        matchingItems.push(titleWithoutDate);
      }
    });

    return matchingItems.length > 0 ? matchingItems : ['No menu items found.'];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading menu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <Link href="/">
            <Button variant="outline">Return to Home</Button>
          </Link>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center text-3xl">Today's Lunch is:</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-center text-xl space-y-2">
              {todayMenu.map((item, index) => (
                <li key={index} className="list-none">{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-3xl">Tomorrow's Lunch is:</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-center text-xl space-y-2">
              {tomorrowMenu.map((item, index) => (
                <li key={index} className="list-none">{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
