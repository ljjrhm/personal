// 导入样式
import "./personal.less";
import { BasePage, PageRegister } from ".../../../src/framework/component/page";
import { ParseUrl } from "../../../src/framework/basic/parseUrl";
import { PageSource } from "../../../src/framework/component/pageSource";
import { Cookie } from "../../../src/framework/basic/cookie";
import { ReactDOM } from "../../../src/framework/component/react-dom";
import { React } from "../../../src/framework/component/react";
import { PageEvent, PageType } from "../../../src/framework/component/pageEvent";
import { Json } from "../../../src/framework/basic/json";
import { Key } from "../../../src/framework/basic/key";
import { Focus } from "../../../src/framework/component/focus";
import { HeaderModule } from "../../src/component/head/head";
import { CityInfo, CityPath, ProviceCode, CityEntity, cityName } from '../../../src/models/cityInfo';
import { CommonLogic } from '../../../src/logics/commonLogic';
import { ToastModule } from '../../../src/component/toast/toast';
import { HElement } from '../../../src/framework/basic/helement';

//异步加载图片
const shoucang = require('../../../src/package/images/personal/shoucang.png');
const yuyue = require('../../../src/package/images/personal/yuyue.png')
const zhuxiao = require('../../../src/package/images/personal/logout.png')
enum MType {
    Page,
    Head,
    city,
    Main,
}

interface IRequest {
}
interface IMemo {
    key: number;
    index: number;
}
interface IPageProps {
    identCode: MType.Page;
    event: PageEvent;
}
interface IPageState {
    list: { url: string }[];
}


interface IMain {
    key: number;
    index: number;
    chanel?: number;
    type: string;
}
interface IMainProps {
    identCode: MType.Main;
    event: PageEvent;
}
interface IMainState {
    list: { imgurl: string, hrefurl: string,params?:any }[];
}

class MainModule extends React.Component<IMainProps, IMainState>{
    constructor(props: IMainProps) {
        super(props);
    }
    render() {
        return (
           <div  class="personal">
                 <div class="ps_title">我的</div>
                 <div class="ps_items">
                    <ul class="list_box">
                        <li class="ps_item" tag = "focus"  data-keydown={React.props({url:'./appoint.html',catalog:"collection"})}>
                            <img class="item_icon" src={shoucang} alt=""/>
                            <div class="item_content">
                                <div class="text_small">收藏</div>
                            </div>
                        </li>
                        <li class="ps_item" tag = "focus"  data-keydown={React.props({url:'./appoint.html',catalog:"appoint"})}>
                            <img class="item_icon" src={yuyue} alt=""/>
                            <div class="item_content">
                                <div class="text_small">预约</div>
                            </div>
                        </li>
                        <li class="ps_item" tag = "focus"  data-keydown={React.props({url:'./index.html',catalog:"logout"})}>
                            <img class="item_icon" src={zhuxiao} alt=""/>
                            <div class="item_content">
                                <div class="text_small">注销</div>
                            </div>
                        </li>
                    </ul>
                 </div>
           </div>
        )
    }

    subscribeToEvents() {
        this.onfocus((e) => {
          
        });
        this.onkeydown((e) => {
            if (Key.Right === e.keyCode || Key.Left === e.keyCode || Key.Up === e.keyCode || Key.Down == e.keyCode) {
                this.autoFocus(e.keyCode);
            }
            else if (Key.Enter === e.keyCode) {
                let memo : IMemo = {
                    key: this.identCode,
                    index: this.index
                }
                this.trigger(PageType.Blank, { url: e.data.url,catalog:e.data.catalog,memo: memo});
            }else if (Key.Backspace === e.keyCode){
                this.trigger(PageType.Previous)
            }
        })
    }
    componentFocusUpdate() {
        if (!this.tags || !this.tags.length || this.tags.length <= this.index || this.identCode !== this.event.getTargetIdentCode()) {
            return;
        }
        this.tags.removeClass("focus");
        this.tags.eq(this.index).addClass("focus");
    }

    autoFocus(keyCode) {
        let f = Focus.area(this.tags, this.index, keyCode);

        if (f) {
            this.setFocus(f.index);
        } else {
            // if (Key.Up === keyCode) {
            //     this.event.target(MType.Head);
            //     this.tags.removeClass("focus").eq(this.index);
            // }
        }
    }

    componentDidMount() {
        // 恢复坐标
        if (memo) {
            const { index } = memo;
            this.setFocus(index);

            memo = null;
        }
    }
}


class PageModule extends React.Component<IPageProps, IPageState>{
    constructor(props: IPageProps) {
        super(props);
    }
    
    render() {
        return (
            <div class="index">
                <div class="header">
                    <HeaderModule identCode={MType.Head} event={this.event}  up={-1} left={-1} down={MType.Main} right={-1} />
                </div>
                <MainModule identCode={MType.Main} event={this.event} />
                <ToastModule/>
            </div>
        );
    }

    subscribeToEvents() {

    }
    componentFocusUpdate() {

    }
}
let memo: IMemo;
let lgc = new CommonLogic();
let cityInfo = new CityInfo();
let accountId:string;
let userToken:string;
let toast:HElement;
class Page extends BasePage<IRequest> {
    init() {
        this.source.saveToLocal(document.referrer || "-1");
        if(this.cokStatus.getCookie()){
            memo = Json.deSerializ(this.cokStatus.getCookie());
        }
        let accountIdCookie = new Cookie("index_user_id");
        let userTokenCookie = new Cookie("index_token");
        accountId = accountIdCookie.getCookie();
        userToken = userTokenCookie.getCookie();
    }

    load() {
        ReactDOM.render(<PageModule identCode={MType.Page} event={this.event}/>, document.getElementById('page'));
        this.event.target(MType.Main);
        toast = new HElement("#showToast");
    }

    openBlank(params) {
        const { url,catalog ,memo} = params;
        if (memo) {
            this.cokStatus.setCookie(Json.serializ(memo));
        }
        if (url) {
            if(catalog=="logout"){
                lgc.logout({"userId":accountId},(info)=>{
                    if(info.success){
                        toast.html("<p>注销成功</p>");
                        toast.toast();
                        let accountIdCookie = new Cookie("index_user_id");
                        let userTokenCookie = new Cookie("index_token");
                        let headPersonCookie = new Cookie("headPersonCookie");
                        accountIdCookie.clearCookie();
                        userTokenCookie.clearCookie();
                        headPersonCookie.clearCookie();
                        window.location.href = `${url}`;
                    }else{
                        toast.html("<p>注销失败</p>");
                        toast.toast();
                    }
                });
                
            }else{
                window.location.href = `${url}?catalog=${catalog}`;
            }
        }
    }
    openPrevious() {
        let url = this.source.takeToLocal();
        this.cokStatus.clearCookie();
        this.source.removeToLocal();

        if (url) {
            window.location.href = url;
        }
    }
}

PageRegister(Page, {
    handler: [
        MType.Page,
        MType.Head,
        MType.city,
        MType.Main,
    ],
    request: new ParseUrl(location.search).getDecodeURIComponent(),
    source: new PageSource('personal_source_'+cityName),
    cokStatus: new Cookie('personal_status_'+cityName)
});
