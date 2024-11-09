import { Link, Outlet } from 'umi';
import './index.less';
import { TwitterOutlined, WechatOutlined } from '@ant-design/icons';
import { ReactComponent as Telegram } from '../assets/images/telegram.svg';
import { Popover } from 'antd';
import WeChatGroup from '../assets/images/WechatGroup.jpg';

export default function Layout() {
  const qrCode = (
    <div className="qrCode">
      <img src={WeChatGroup} alt="" />
    </div>
  );
  return (
    <div className="app-layout">
      {/* <div className="app-header">Header</div> */}
      <Outlet />
      <div className="app-footer">
        <div className="footer-container">
          <div
            className="media"
            onClick={() => window.open(`https://twitter.com/Solana_zh`)}
          >
            <TwitterOutlined />
            <span className="label">Twitter</span>
          </div>
          <div
            className="media"
            onClick={() => window.open(`https://t.me/solanadevcamp`)}
          >
            <Telegram />
            <span className="label">Telegram</span>
          </div>
          <div className="media wechat">
            <Popover content={qrCode} color="#222">
              <WechatOutlined />
              <span className="label">Wechat</span>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
}
