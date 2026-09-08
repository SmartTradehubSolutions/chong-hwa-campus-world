import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Chong Hwa · A Little Campus World',description:'Explore Chong Hwa Independent High School, Kuala Lumpur, as a miniature 3D world. Flatten into a campus plan and step inside with official 360° panoramas.',icons:{icon:'/branding/chkl-official-crest.png',apple:'/branding/chkl-official-crest.png'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
