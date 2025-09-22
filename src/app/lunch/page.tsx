'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { Particles } from '@/components/magicui/particles';
import { parse } from 'rss-to-json';

interface MenuItem {
  title: string;
}

export default function Lunch() {
  const [todayMenu, setTodayMenu] = useState<string[]>([]);
  const [tomorrowMenu, setTomorrowMenu] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMenus, setCalendarMenus] = useState<{[key: string]: string[]}>({});

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const rssUrl = "https://brrice.tandem.co/index.php?type=export&action=rss&export_type=menus";
        const rss = await parse(rssUrl);

        if (rss.items && Array.isArray(rss.items)) {
          const today = new Date();
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);

          const todayItems = getMenuItems(rss.items, today);
          const tomorrowItems = getMenuItems(rss.items, tomorrow);

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

  const generateCalendarData = () => {
    const calendarData: {[key: string]: {date: Date, dayName: string, month: number, dayOfMonth: number}} = {};
    const today = new Date();

    // Generate next 14 days (2 weeks)
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      calendarData[key] = {
        date,
        dayName: dayNames[date.getDay()],
        month: date.getMonth(),
        dayOfMonth: date.getDate()
      };
    }

    return calendarData;
  };

  const loadCalendarMenus = async () => {
    if (Object.keys(calendarMenus).length > 0) return; // Already loaded

    try {
      const rssUrl = "https://brrice.tandem.co/index.php?type=export&action=rss&export_type=menus";
      const rss = await parse(rssUrl);

      if (rss.items && Array.isArray(rss.items)) {
        const calendarData = generateCalendarData();
        const menus: {[key: string]: string[]} = {};

        Object.keys(calendarData).forEach(key => {
          menus[key] = getMenuItems(rss.items, calendarData[key].date);
        });

        setCalendarMenus(menus);
      }
    } catch (error) {
      console.error('Error loading calendar menus:', error);
    }
  };

  const formatDate = (date: Date): string => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const day = date.getDate();
    const ordinal = day === 1 || day === 21 || day === 31 ? 'st' :
                   day === 2 || day === 22 ? 'nd' :
                   day === 3 || day === 23 ? 'rd' : 'th';

    return `${dayNames[date.getDay()]}, ${monthNames[date.getMonth()]} ${day}${ordinal}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading menu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 relative">
      <Particles
        className="absolute inset-0"
        quantity={40}
        ease={70}
        color="#4ecdc4"
        refresh={false}
      />
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="mb-8 flex justify-between items-center">
          <Link href="/">
            <Button variant="outline">Return to Home</Button>
          </Link>
          <ThemeToggle />
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

        <Card className="mb-8">
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

        <div className="mb-8 text-center">
          <Button
            onClick={async () => {
              setShowCalendar(!showCalendar);
              if (!showCalendar) {
                await loadCalendarMenus();
              }
            }}
            variant="outline"
          >
            {showCalendar ? 'Hide' : 'Show'} Lunch Calendar
          </Button>
        </div>

        {showCalendar && (
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">Upcoming Lunches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(() => {
                  const calendarData = generateCalendarData();
                  return Object.entries(calendarMenus).map(([dateKey, menuItems]) => {
                    const today = new Date();
                    const menuDate = calendarData[dateKey]?.date || new Date(dateKey + 'T00:00:00');
                    const isToday = menuDate.toDateString() === today.toDateString();
                    const isTomorrow = menuDate.toDateString() === new Date(today.getTime() + 24 * 60 * 60 * 1000).toDateString();

                    if (isToday || isTomorrow) return null; // Skip today and tomorrow as they're shown above

                    return (
                      <div key={dateKey} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                        <h3 className="font-semibold text-lg mb-2 dark:text-gray-100">
                          {formatDate(menuDate)}
                        </h3>
                        <ul className="text-sm space-y-1">
                          {menuItems.map((item, index) => (
                            <li key={index} className="text-gray-700 dark:text-gray-300">
                              {item === 'No menu items found.' ? 'No school' : item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  });
                })()}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
