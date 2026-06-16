# Ztor Creator Studio e-shop 业务流程图

更新时间：2026-06-16

信息来源：

- 需求页：https://aic-output.vercel.app/ztor/ztor-eshop-wireframe-2026-06-11.html
- 商品管理原型：https://ztor-v2-creator-studio.vercel.app/e-shop.html
- 订单管理原型：https://ztor-v2-creator-studio.vercel.app/orders.html
- 商店设置原型：https://ztor-v2-creator-studio.vercel.app/store-settings.html
- 收入管理原型：https://ztor-v2-creator-studio.vercel.app/earnings.html
- 原型关联页：`create-product.html`、`product-detail.html`、`create-bundle.html`、`order-detail.html`

适用范围：Creator Studio 第一期 e-shop 功能。本文重点描述内部运营后台的业务流、权限流、商品发布流、订单履约流、收入对账流和一期依赖边界。买家端、支付、履约只作为 e-shop 闭环依赖，不在本文展开买家端页面级实现。

## 原型页面对照

| 模块 | 原型入口 | 业务职责 | 与其他模块关系 |
| ---- | -------- | -------- | -------------- |
| 商品管理 | https://ztor-v2-creator-studio.vercel.app/e-shop.html | 管理 Products、Bundles、Auctions 占位、低库存提醒、Shop 可见性、粉丝视角预览 | 商品上架后进入买家端；下单后触发订单和收入事件 |
| 订单管理 | https://ztor-v2-creator-studio.vercel.app/orders.html | 管理订单列表、KPI、搜索、状态筛选、导出、订单详情和履约 | 读取订单金额快照，但金额口径以 Earnings 为准 |
| 商店设置 | https://ztor-v2-creator-studio.vercel.app/store-settings.html | 管理店面资料、URL、简介、币别、商品陈列排序、配送默认值、Stripe 状态 | 影响粉丝端店铺展示和新建商品默认配送配置 |
| 收入管理 | https://ztor-v2-creator-studio.vercel.app/earnings.html | 管理收入总览、交易明细、收益拆解、提现、税务文件 | 是订单金额、退款/争议、结算和提现的唯一金额口径 |

## 1. 一期业务目标

Creator Studio 第一期以“内部运营代创作者管理店铺”为核心：

- Admin 在 Creator Studio 创建创作者资料，系统同步生成该创作者的 eShop。
- Admin 选择某个创作者后，进入该创作者作用域下的商品、套组、订单、收入、商店设置、补货和预览能力。
- 已发布且开启 Shop 可见的商品进入买家端店铺展示。
- 买家下单后生成订单，订单进入履约管理，金额进入 Earnings 统一对账和结算。

范围差异需要产品确认：

- 需求页的 D4 已决策为“实体商品 + bundles only”，排除虚拟商品、音乐、活动票、会员卡。
- 原型中保留了 Digital file 和 Auctions 入口，其中 Auctions 已明确为 later release。
- 本文默认一期实现实体商品和套组；Digital file 仅作为原型遗留入口或后续能力，不进入一期主链路。

## 2. 总体业务闭环

```mermaid
flowchart TD
  A["Admin 创建创作者资料"] --> B["系统自动生成 eShop"]
  B --> C["Admin 选择创作者并进入作用域"]
  C --> D["配置商店资料和展示顺序"]
  C --> E["创建或编辑商品"]
  C --> F["创建或编辑套组"]

  E --> G{"商品是否满足上架条件"}
  F --> H{"套组是否满足上架条件"}
  G -->|"否"| I["保存草稿"]
  H -->|"否"| I
  G -->|"是"| J["发布商品并开启 Shop 可见"]
  H -->|"是"| K["发布套组并开启 Shop 可见"]

  J --> L["Published shop 内容进入买家端"]
  K --> L
  L --> M["粉丝浏览 /shop/:handle 或商品详情"]
  M --> N{"支付方式"}
  N -->|"Fiat"| O["Stripe 支付"]
  N -->|"POPCORN"| P["复用既有虚拟币流程"]

  O --> Q["创建订单并扣减库存"]
  P --> Q
  Q --> R["订单进入 Order management"]
  Q --> S["生成 Earnings revenue event"]
  R --> T{"交付方式"}
  T -->|"线下物流"| U["运营填写物流并标记出货"]
  T -->|"QR 现场取货"| V["买家出示动态 QR 并现场核销"]
  U --> W["订单完成"]
  V --> W
  S --> X["Pending settlement"]
  X -->|"T+7 / 无争议"| Y["Available to withdraw"]
  W --> Z["销售、库存、收入数据回流"]
  Y --> Z
```

关键约束：

- 商店创建发生在 Creator Studio，创建创作者资料时自动生成，不在 BO 单独建店。
- 只有 Published shop 和已开启 Shop 可见的商品会进入买家端展示。
- Fiat 支付对 Ztor 是新增链路，首期按 Stripe；POPCORN 购买复用既有流程。
- Order management 负责履约、订单状态、退款/争议入口；金额计算和退款/争议的收入影响以 Earnings 为准，订单详情不重新计算。
- 一期 e-shop 需求页写明不做退款；但原型已有退款/争议入口，建议一期至少保留只读或占位入口，真实退款流需业务确认。
- POPCORN 收入兑付为现金以外的结算方案暂缓。
- QR 取货是需求页标记的 blocker，需要进一步明确 token、刷新频率、核销角色和异常处理。

## 3. 角色和权限流

```mermaid
flowchart TD
  A["Admin 登录 Creator Studio"] --> B["进入 Creators 全局列表"]
  B --> C["创建创作者资料"]
  C --> D["生成 creator_profile 和 eShop"]
  B --> E["选择一个创作者"]
  E --> F["进入该创作者作用域"]
  F --> G["Products"]
  F --> H["Bundles"]
  F --> I["Store settings"]
  F --> J["Orders"]
  F --> M["Earnings"]

  K["Creator 自助登录"] --> L["只看自己的店铺作用域"]
  L --> G
  L --> H
  L --> I
  L --> J
  L --> M

  K -. "Phase 2" .-> L
```

权限口径：

| 角色 | 一期权限 | 说明 |
| ---- | -------- | ---- |
| Admin | 可查看创作者列表；选择创作者后代运营该创作者店铺 | Admin 没有跨创作者的商品全局视图，必须先选择创作者 |
| Creator | Phase 2 自助入口；仅能管理自己的 Product / Orders / Earnings | 一期由内部运营代操作 |
| Buyer | 买家端浏览和购买 | 不进入 Creator Studio |

## 4. 商品发布和可见性状态

```mermaid
flowchart LR
  A["Draft 草稿"] -->|"补齐必填项"| B["Ready 可发布"]
  B -->|"Start selling"| C["Live 已上架"]
  C -->|"Shop toggle off"| D["Hidden 已隐藏"]
  D -->|"Shop toggle on"| C
  C -->|"库存小于等于阈值"| E["Low Stock 库存过低"]
  E -->|"提交补货"| F["Restocking 补货中"]
  F -->|"Mark received"| C
  C -->|"库存为 0"| G["Sold Out 已售完"]
  G -->|"补货入库"| C
```

状态说明：

- `Draft`：保存但未对粉丝可见。
- `Live`：满足发布条件并开启 Shop 可见。
- `Hidden`：商品仍存在，但不在粉丝端展示。
- `Low Stock`：由库存和低库存阈值推导，用于提醒运营补货。
- `Restocking`：补货流程已提交，等待到货确认。
- `Sold Out`：库存为 0，不可购买。

## 5. 商品创建流程

```mermaid
flowchart TD
  A["点击 New: Create new product"] --> B{"选择商品类型"}
  B -->|"Physical item"| C["上传主图和多角度图片"]
  C --> D["填写商品名称、描述、分类"]
  D --> E["填写规格说明"]
  E --> F{"是否多规格"}
  F -->|"单规格"| G["填写价格、原价、库存"]
  F -->|"多规格"| H["配置选项和值，生成规格表"]
  H --> I["逐规格填写价格、库存、SKU、成本"]
  G --> J{"库存版本"}
  I --> J
  J -->|"不限量"| K["可随时补货"]
  J -->|"限量"| L["填写总量和当前库存"]
  K --> M{"交付方式"}
  L --> M
  M -->|"Shipping"| N["填写重量、尺寸、出货分类、寄件地"]
  M -->|"QR pickup"| O["填写现场取货说明"]
  N --> P["配置购买限制和标签"]
  O --> P
  P --> Q{"是否满足发布条件"}
  Q -->|"否"| R["Save for later"]
  Q -->|"是"| S["Start selling"]

  B -->|"Digital file"| T["一期范围待确认"]
  B -->|"Auction"| U["后续版本，仅保留占位"]
```

发布条件建议按原型 readiness 收敛：

- 商品名称、描述、分类。
- 主图。
- 价格。
- 库存或规格库存。
- 实体商品的配送或取货配置。
- 若开启每人限购，需要填写最大购买量。

## 6. 套组创建流程

```mermaid
flowchart TD
  A["点击 New: Create bundle from products"] --> B["填写套组名称"]
  B --> C["从现有商品中选择成员"]
  C --> D{"成员数是否大于等于 2"}
  D -->|"否"| E["禁用 Create bundle"]
  D -->|"是"| F{"定价方式"}
  F -->|"Fixed price"| G["填写套组固定价"]
  F -->|"% off"| H["填写折扣比例，规格待补"]
  G --> I["填写限量，可留空为不限量"]
  H --> I
  I --> J["创建套组"]
  J --> K["套组库存取成员商品最小可售库存"]
  K --> L["在 Bundles 列表管理可见性"]
```

## 7. 补货和低库存流程

```mermaid
flowchart TD
  A["系统检测低库存商品"] --> B["E-Shop 顶部展示低库存通知"]
  B --> C["Admin 点击 View low stock"]
  C --> D["打开 Restock modal"]
  E["列表行 Restock"] --> D
  F["商品详情 Restock"] --> D
  D --> G["选择或确认补货商品"]
  G --> H["提交补货"]
  H --> I["商品状态变为 Restocking"]
  I --> J["到货后 Mark received"]
  J --> K["库存增加，状态恢复 Live 或 Low Stock"]
```

## 8. 店铺设置流程

```mermaid
flowchart TD
  A["进入 Store settings"] --> B["编辑店面识别"]
  B --> C["上传或更换 logo / cover"]
  B --> D["编辑店名、URL slug、简介、币别"]
  A --> E["商品陈列排序"]
  E --> F["仅展示已上架商品"]
  A --> G["查看 Payment settings"]
  G --> H["Stripe connected 只读状态"]
  A --> I["Shipping defaults"]
  I --> J["填写默认寄件地址"]
  I --> K["填写免运门槛"]
  A --> L["See as fan 预览"]
  B --> M["Save changes"]
  E --> M
  I --> M
```

## 9. 订单管理流程

```mermaid
flowchart TD
  A["买家支付成功"] --> B["创建订单"]
  B --> C["扣减商品或套组库存"]
  B --> D["Order management 列表出现订单"]
  D --> E["展示 KPI: 待出货 / 待处理 / 退款争议 / 30 天完成"]
  D --> F["搜索订单或按状态筛选"]
  F --> G["打开订单详情"]
  G --> H["查看品项、买家、地址和联系方式"]
  G --> I["查看金额拆解"]
  I --> J["金额来源于 Earnings，不在订单详情重算"]
  G --> K{"履约类型"}
  K -->|"Shipping"| L["填写物流商和 tracking number"]
  L --> M["Mark shipped"]
  M --> N["Shipped"]
  N --> O["Completed"]
  K -->|"QR pickup"| P["核销 QR 并记录领取状态"]
  P --> O
  G --> Q["Refund / dispute 入口"]
  Q --> R["收入影响交给 Earnings 处理"]
```

订单状态口径：

- `Unpaid`：待付款。
- `Paid`：已付款，尚未进入出货处理。
- `To ship`：待出货。
- `Shipped`：已出货。
- `Completed`：已完成。
- `Refund / dispute`：退款或争议中。金额冻结、扣回或恢复均由 Earnings 的交易事件决定。

## 10. 收入管理流程

```mermaid
flowchart TD
  A["订单支付成功"] --> B["生成 revenue event"]
  B --> C["Transactions 交易明细"]
  C --> D["按来源筛选: E-Shop / Event / IP / Licensing / Streaming / Project / Payout"]
  C --> E["展开交易查看 Event ID、费率版本和单笔 waterfall"]
  B --> F["Overview 汇总"]
  F --> G["Gross revenue"]
  F --> H["Net income"]
  F --> I["Pending settlement"]
  F --> J["Available to withdraw"]
  H --> K["Breakdown 收益拆解"]
  K --> L["Gross revenue - direct costs - platform/payment fees - royalties - Ztor cut"]
  L --> M["Net profit pool"]
  M --> N["Payouts 提款"]
  N --> O{"是否有可用银行账户和可提领余额"}
  O -->|"是"| P["Request payout"]
  O -->|"否"| Q["Add payout bank / blocked"]
  C --> R["Refund / dispute 事件"]
  R --> S["争议期冻结 Available，结果由 Earnings 恢复或扣减"]
  C --> T["Manual entry"]
  T --> U["标记 unverified，不计入 Available / payout / tax"]
```

收入状态口径：

- `Pending`：待结算，保留 T+7 争议期，不可提现。
- `Available`：可提领，Request payout 的资金来源。
- `Payout Requested`：提现申请中。
- `Paid`：已入账或已支付。
- `Failed`：支付或提现失败。
- `Disputed`：争议中，金额从可提领余额冻结。
- `Manual · unverified`：手动补登，不进入可提领、提现和税务文件。

关键约束：

- Pending 不等于 Available。
- 订单详情、商品详情可以展示金额摘要，但金额口径以 Earnings 为唯一来源。
- 只有 settled income 进入净利池和可提领余额。
- 如果净利池为负，分配暂停并向后结转，已支付金额不追回。

## 11. 系统边界和依赖

| 边界 | 业务含义 | 一期处理 |
| ---- | -------- | -------- |
| User DB | Ztor 单一身份体系 | 复用现有用户，不建独立 artist auth |
| creator_profile | 创作者实体，关联 user_id 和 handle | Creator Studio 创建，eShop 自动生成 |
| Commerce module | Shop、Product、Inventory、Order | 复用 Beamco commerce module，API 规格需补齐 |
| Creator Studio gateway | Creator Studio 调 commerce 的服务边界 | 由 Beamco team 负责 |
| Ztor client API gateway | 买家端调 commerce 的服务边界 | 由 Ztor team 负责 |
| Stripe | 新增 Fiat 支付链路 | 首期 Stripe only |
| POPCORN | 既有虚拟币购买流程 | 复用现有链路，只新增 merch 购买场景 |
| QR pickup | 现场取货核销 | 需求已标 blocker，需要方案确认 |
| Order management | 订单履约、状态、买家和出货信息 | 金额只读引用 Earnings，不自行重算 |
| Earnings | 交易事件、收益拆解、提现和税务文件 | e-shop 订单金额统一在此对账和结算 |
| Posts service | Feed 商品卡片 | 新增 product-card attachment，非 Creator Studio 一期核心页面 |

## 12. 待确认问题

1. 一期是否严格按需求页 D4 只做实体商品和套组，还是保留 Digital file 创建能力。
2. Creator registration approval 是否需要一期审批流。
3. Stripe Connect、平台抽佣比例、结算币别和 payout schedule 是否只在 Earnings 维护。
4. QR pickup 的 token 生成、刷新、核销、过期和异常补核销规则。
5. Commerce module API 是否已有 Product、Bundle、Inventory、Order、Store settings 的正式字段规格。
6. 原型有退款/争议入口，但需求页写明 no refunds in v1，一期是完全隐藏、只读占位，还是开放内部处理入口。
7. Earnings 是本期完整收入管理模块，还是只交付 e-shop 订单对账、交易明细和提现最小闭环。
