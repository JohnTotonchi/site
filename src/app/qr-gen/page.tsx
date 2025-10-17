'use client';

import { useState, useRef, useEffect } from 'react';
import QRCode from 'react-qr-code';
import QRCodeLib from 'qrcode';
import { Download, Share, Copy, QrCode, Link, Mail, Phone, MessageCircle, Wifi, MapPin, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';

export default function QRGenerator() {
  const [activeTab, setActiveTab] = useState('text');
  const [qrData, setQrData] = useState('https://jawn.host');
  const [qrSize, setQrSize] = useState([200]);
  const [qrLevel, setQrLevel] = useState('M');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [fgColor, setFgColor] = useState('#000000');
  const qrRef = useRef<HTMLDivElement>(null);

  // Input values for different types
  const [textInput, setTextInput] = useState('Hello, World!');
  const [urlInput, setUrlInput] = useState('https://jawn.host');
  const [email, setEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [phone, setPhone] = useState('');
  const [smsNumber, setSmsNumber] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [wifiName, setWifiName] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiType, setWifiType] = useState('WPA');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [name, setName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const generateQRData = () => {
    switch (activeTab) {
      case 'text':
        return textInput;
      case 'url':
        return urlInput;
      case 'email':
        return `mailto:${email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      case 'phone':
        return `tel:${phone}`;
      case 'sms':
        return `sms:${smsNumber}?body=${encodeURIComponent(smsMessage)}`;
      case 'wifi':
        return `WIFI:T:${wifiType};S:${wifiName};P:${wifiPassword};;`;
      case 'location':
        return `geo:${lat},${lng}`;
      case 'vcard':
        const vcard = `BEGIN:VCARD
VERSION:3.0
N:${name}
TEL:${contactPhone}
EMAIL:${contactEmail}
END:VCARD`;
        return btoa(vcard.replace(/\n/g, '\r\n'));
      default:
        return textInput;
    }
  };

  const updateQR = () => {
    const data = generateQRData();
    setQrData(data);
  };

  const downloadPNG = async () => {
    try {
      const dataUrl = await QRCodeLib.toDataURL(qrData, {
        width: qrSize[0],
        margin: 2,
        color: { light: bgColor, dark: fgColor },
        errorCorrectionLevel: qrLevel as any,
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'qr-code.png';
      a.click();
    } catch (error) {
      console.error('Failed to generate PNG:', error);
      alert('Failed to download PNG');
    }
  };

  const downloadSVG = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qr-code.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrData);
    alert('QR data copied to clipboard');
  };

  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'QR Code',
          text: qrData,
        });
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Share failed:', error);
          // Fall back to copy if share fails
          copyToClipboard();
        }
        // Silently ignore AbortError (user cancelled)
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="min-h-screen p-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  QR Code Generator
                </CardTitle>
                <CardDescription>
                  Generate QR codes for various types of data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={(value) => {
                  setActiveTab(value);
                  updateQR();
                }}>
                  <TabsList className="grid w-full grid-cols-4 gap-1 bg-muted rounded-lg p-1 h-auto">
                    <TabsTrigger value="text" className="flex-col gap-1 py-1 px-1 h-auto min-h-[2.5rem]">
                      <FileText className="h-4 w-4" />
                      <span className="text-xs">Text</span>
                    </TabsTrigger>
                    <TabsTrigger value="url" className="flex-col gap-1 py-1 px-1 h-auto min-h-[2.5rem]">
                      <Link className="h-4 w-4" />
                      <span className="text-xs">URL</span>
                    </TabsTrigger>
                    <TabsTrigger value="email" className="flex-col gap-1 py-1 px-1 h-auto min-h-[2.5rem]">
                      <Mail className="h-4 w-4" />
                      <span className="text-xs">Email</span>
                    </TabsTrigger>
                    <TabsTrigger value="phone" className="flex-col gap-1 py-1 px-1 h-auto min-h-[2.5rem]">
                      <Phone className="h-4 w-4" />
                      <span className="text-xs">Phone</span>
                    </TabsTrigger>
                    <TabsTrigger value="sms" className="flex-col gap-1 py-1 px-1 h-auto min-h-[2.5rem]">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-xs">SMS</span>
                    </TabsTrigger>
                    <TabsTrigger value="wifi" className="flex-col gap-1 py-1 px-1 h-auto min-h-[2.5rem]">
                      <Wifi className="h-4 w-4" />
                      <span className="text-xs">WiFi</span>
                    </TabsTrigger>
                    <TabsTrigger value="location" className="flex-col gap-1 py-1 px-1 h-auto min-h-[2.5rem]">
                      <MapPin className="h-4 w-4" />
                      <span className="text-xs">Location</span>
                    </TabsTrigger>
                    <TabsTrigger value="vcard" className="flex-col gap-1 py-1 px-1 h-auto min-h-[2.5rem]">
                      <User className="h-4 w-4" />
                      <span className="text-xs">vCard</span>
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-4">
                    <TabsContent value="text">
                      <Textarea
                        placeholder="Enter your text"
                        value={textInput}
                        onChange={(e) => {
                          setTextInput(e.target.value);
                          updateQR();
                        }}
                      />
                    </TabsContent>

                    <TabsContent value="url">
                      <Input
                        placeholder="https://example.com"
                        value={urlInput}
                        onChange={(e) => {
                          setUrlInput(e.target.value);
                          updateQR();
                        }}
                      />
                    </TabsContent>

                    <TabsContent value="email" className="space-y-2">
                      <Input placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                      <Input placeholder="Subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
                      <Textarea placeholder="Email body" value={emailBody} onChange={(e) => setEmailBody(e.target.value)} />
                    </TabsContent>

                    <TabsContent value="phone">
                      <Input placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </TabsContent>

                    <TabsContent value="sms" className="space-y-2">
                      <Input placeholder="Phone number" value={smsNumber} onChange={(e) => setSmsNumber(e.target.value)} />
                      <Input placeholder="Message" value={smsMessage} onChange={(e) => setSmsMessage(e.target.value)} />
                    </TabsContent>

                    <TabsContent value="wifi" className="space-y-2">
                      <Input placeholder="WiFi name (SSID)" value={wifiName} onChange={(e) => setWifiName(e.target.value)} />
                      <Input placeholder="Password" value={wifiPassword} onChange={(e) => setWifiPassword(e.target.value)} />
                      <Select value={wifiType} onValueChange={setWifiType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WPA">WPA/WPA2</SelectItem>
                          <SelectItem value="WEP">WEP</SelectItem>
                          <SelectItem value="nopass">No password</SelectItem>
                        </SelectContent>
                      </Select>
                    </TabsContent>

                    <TabsContent value="location" className="space-y-2">
                      <Input placeholder="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} />
                      <Input placeholder="Longitude" value={lng} onChange={(e) => setLng(e.target.value)} />
                    </TabsContent>

                    <TabsContent value="vcard" className="space-y-2">
                      <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                      <Input placeholder="Phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                      <Input placeholder="Email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Size: {qrSize[0]}px</label>
                  <Slider
                    value={qrSize}
                    onValueChange={setQrSize}
                    max={500}
                    min={100}
                    step={10}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Error Correction Level</label>
                  <Select value={qrLevel} onValueChange={setQrLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">7% (Low)</SelectItem>
                      <SelectItem value="M">15% (Medium)</SelectItem>
                      <SelectItem value="Q">25% (Quartile)</SelectItem>
                      <SelectItem value="H">30% (High)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium">Foreground Color</label>
                    <Input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Background Color</label>
                    <Input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* QR Preview and Actions */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>QR Code Preview</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div ref={qrRef} className="border p-4 rounded-lg bg-white">
                  <QRCode
                    value={qrData}
                    size={qrSize[0]}
                    level={qrLevel as 'L' | 'M' | 'Q' | 'H'}
                    bgColor={bgColor}
                    fgColor={fgColor}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={downloadSVG} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download SVG
                  </Button>
                  <Button onClick={downloadPNG} variant="outline" size="sm">
                    Download PNG
                  </Button>
                  <Button onClick={copyToClipboard} variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Text
                  </Button>
                  <Button onClick={shareQR} variant="outline" size="sm">
                    <Share className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>QR Data</CardTitle>
              </CardHeader>
              <CardContent>
                <code className="text-xs break-all bg-muted p-2 rounded block">
                  {qrData}
                </code>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
