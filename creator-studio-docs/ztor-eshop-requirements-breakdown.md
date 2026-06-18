# Ztor Creator Studio e-shop 需求拆解文档

更新时间：2026-06-16

关联流程图：[ztor-eshop-business-flow.md](./ztor-eshop-business-flow.md)

信息来源：

- 需求页：https://aic-output.vercel.app/ztor/ztor-eshop-wireframe-2026-06-11.html
- 商品管理原型：https://ztor-v2-creator-studio.vercel.app/e-shop.html
- 订单管理原型：https://ztor-v2-creator-studio.vercel.app/orders.html
- 商店设置原型：https://ztor-v2-creator-studio.vercel.app/store-settings.html
- 收入管理原型：https://ztor-v2-creator-studio.vercel.app/earnings.html
- 原型关联页：`create-product.html`、`product-detail.html`、`create-bundle.html`、`order-detail.html`

适用范围：Creator Studio 第一期 e-shop 功能拆解。默认一期以内部运营代管理为主，先实现创作者作用域下的商品、套组、订单、收入、商店设置、预览、补货和可见性管理。

## 原型模块对照

| 模块 | 原型入口 | 本文覆盖章节 | 核心页面能力 |
| ---- | -------- | ------------ | ------------ |
| 商品管理 | https://ztor-v2-creator-studio.vercel.app/e-shop.html | 5.2、5.3、5.4、5.5、5.7 | Products / Bundles / Auctions tab、低库存提醒、搜索、状态筛选、Shop toggle、粉丝视角预览、新建商品、新建套组、商品详情、补货 |
| 订单管理 | https://ztor-v2-creator-studio.vercel.app/orders.html | 5.8、5.9 | 订单 KPI、搜索、状态筛选、导出、订单详情、买家信息、品项与金额、履约、Mark shipped、退款/争议入口 |
| 商店设置 | https://ztor-v2-creator-studio.vercel.app/store-settings.html | 5.6 | 店面 cover / logo、店名、URL slug、简介、币别、商品陈列排序、Stripe 状态、默认寄件地址、免运门槛、粉丝视角预览 |
| 收入管理 | https://ztor-v2-creator-studio.vercel.app/earnings.html | 5.10 | Gross / Net / Pending / Available KPI、Overview、Transactions、Breakdown、Payouts、Tax documents、Manual entry、交易展开追踪 |

模块口径：

- 商品管理决定“卖什么、是否可见、库存是否足够”。
- 订单管理决定“订单如何履约、状态如何推进”，不重新计算金额。
- 商店设置决定“粉丝看到的店面信息和商品排序”。
- 收入管理决定“钱的口径、结算、提现、退款/争议影响和税务文件”。

## 1. 背景和目标

Creator Studio 需要承接 Ztor eShop 的后台管理能力。第一期目标不是做完整自助创作者平台，而是让内部运营人员能够：

1. 进入某个创作者的 eShop 管理上下文。
2. 创建、编辑、上架和隐藏商品。
3. 创建、编辑、上架和隐藏套组。
4. 配置商店基础信息、展示顺序、支付状态和配送默认值。
5. 处理低库存和补货。
6. 处理订单履约、出货、QR 取货和订单状态。
7. 在收入管理中查看 e-shop 订单交易、收益拆解、可提领金额和提现状态。
8. 以粉丝视角预览店铺和商品。

一期上线后，买家端只消费已发布商店和已上架商品；Creator Studio 不直接实现买家端 checkout UI。买家支付成功后，订单进入 Order management，金额进入 Earnings 统一对账，订单详情不自行重新计算金额。

## 2. 一期范围

### 2.1 必做范围

- 创作者作用域：Admin 选择创作者后进入该创作者的 e-shop 管理视图。
- E-Shop 列表页：商品、套组、竞标占位、搜索、状态筛选、低库存提醒、可见性开关、行操作。
- 商品创建和编辑：以实体商品为主，支持媒体、基础信息、分类、规格、价格、库存、配送、QR 取货、购买限制、标签、预览、保存草稿、开始销售。
- 商品详情页：编辑核心字段、查看销售摘要、补货、查看被项目引用提示。
- 套组创建和编辑：选择至少 2 个商品，设置固定价或折扣，设置限量，展示套组库存。
- 商店设置：店面资料、URL slug、简介、币别、商品陈列排序、Stripe 状态、默认寄件地址、免运门槛、粉丝视角预览。
- 补货流程：低库存提醒、补货弹窗、补货中状态、到货恢复状态。
- 订单管理：订单列表、KPI、搜索、状态筛选、导出、订单详情、买家信息、履约信息、出货操作。
- 收入管理：收入总览、交易明细、收益拆解、提现、税务文件占位；e-shop 订单金额与 Earnings 对账。

### 2.2 暂不纳入一期

- 创作者自助 SSO 和 Creator 自己登录管理。
- 创作者注册审批流，除非业务确认必须一期上线。
- Auctions builder。原型明确标注 timed-auction setup arrives in a later release。
- 完整退款自动化。原型已有 Refund / dispute 入口，但需求页写明 no refunds in v1；一期建议隐藏、置灰或作为内部处理占位。
- POPCORN payout。
- 完整物流商集成。需求页口径为 shipping offline v1。
- 买家端页面开发、checkout 页面开发、Feed product-card 发布器。

### 2.3 范围冲突

需求页 D4 写明“Physical goods + bundles only”，排除虚拟商品、音乐、活动票和会员卡；原型的 create-product 页面仍包含 Digital file。默认按需求页优先级处理：

- 一期实现 Physical item 和 Bundle。
- Digital file 入口可以隐藏、置灰或保留为后续占位，需产品确认最终呈现。
- Auction 入口保留占位，不进入创建闭环。

## 3. 角色和权限

| 角色 | 一期行为 | 权限边界 |
| ---- | -------- | -------- |
| Admin | 代创作者管理店铺 | 先选择创作者，再进入该创作者的 Product / Bundle / Store settings / Orders / Earnings |
| Creator | 后续自助管理 | Phase 2，仅能管理自己的店铺，不能切换创作者 |
| Buyer | 买家端浏览和购买 | 不进入 Creator Studio |

权限要求：

- Admin 可以看到 Creators 全局列表。
- Product、Bundle、Store settings、Orders、Earnings 都必须带创作者上下文。
- 未选择创作者时，不允许进入某个店铺的商品管理。
- Creator role 后续启用时，不显示 Creators 模块。

## 4. 前端信息架构

建议路由仅作为实现参考，最终以现有 TanStack Router 约定落地：

| 页面 | 建议路由 | 说明 |
| ---- | -------- | ---- |
| 创作者列表 | `/creators` | Admin 全局入口，一期如已有创作者上下文可先不做完整列表 |
| E-Shop 商品管理 | `/e-shop` | 商品、套组、竞标占位、筛选和操作入口 |
| 新增商品 | `/e-shop/products/new` | 对应原型 `create-product.html` |
| 商品详情/编辑 | `/e-shop/products/$id` | 对应原型 `product-detail.html` |
| 新增套组 | `/e-shop/bundles/new` | 对应原型 `create-bundle.html` |
| 商店设置 | `/e-shop/settings` | 对应原型 `store-settings.html` |
| 订单管理 | `/e-shop/orders` | 对应原型 `orders.html` |
| 订单详情 | `/e-shop/orders/$id` | 对应原型 `order-detail.html` |
| 收入管理 | `/earnings` 或 `/e-shop/earnings` | 对应原型 `earnings.html`；若 Earnings 是全局模块，需按 creator 作用域过滤 |

## 5. 功能拆解

### 5.1 创作者上下文

| 编号 | 功能 | 需求说明 | 验收要点 | 优先级 |
| ---- | ---- | -------- | -------- | ------ |
| CS-ESHOP-001 | 创作者上下文进入 | Admin 选择创作者后进入其 e-shop 管理视图 | 页面请求均携带 creator/shop 标识；切换创作者后数据随之切换 | P0 |
| CS-ESHOP-002 | 作用域权限控制 | 商品、套组、商店设置都限制在当前创作者 | 不能看到其他创作者商品；未选择创作者时不给管理入口 | P0 |
| CS-ESHOP-003 | 商店自动生成依赖 | 创建 creator_profile 后自动生成 eShop | 前端只消费 shop 信息，不提供单独“创建店铺”入口 | P0 |

### 5.2 E-Shop 列表页

| 编号 | 功能 | 需求说明 | 验收要点 | 优先级 |
| ---- | ---- | -------- | -------- | ------ |
| CS-ESHOP-010 | 低库存通知条 | 页面顶部展示低库存商品数量和名称 | 有低库存时展示；可关闭；点击进入补货弹窗或低库存过滤 | P0 |
| CS-ESHOP-011 | 主标签页 | 支持 Products、Bundles、Auctions 三个 tab | Products 默认选中；Bundles 展示套组；Auctions 展示后续版本空状态 | P0 |
| CS-ESHOP-012 | 搜索 | 按商品或套组名称筛选当前 tab | 输入后只影响当前 tab 列表 | P0 |
| CS-ESHOP-013 | 状态筛选 | 支持 All、Live、Low Stock、Sold Out、Draft | 状态筛选和搜索可叠加 | P0 |
| CS-ESHOP-014 | 商品列表字段 | 图片、商品名、分类、价格、状态、库存、Shop 开关、操作 | 字段与原型一致；空图片展示占位 | P0 |
| CS-ESHOP-015 | 套组列表字段 | 图片、套组名、成员、套组价、状态、库存、Shop 开关、操作 | 套组库存显示成员中最小可售库存 | P0 |
| CS-ESHOP-016 | Shop 可见性开关 | 控制商品或套组是否在粉丝端商店可见 | 关闭后状态为 Hidden；重新开启恢复原状态 | P0 |
| CS-ESHOP-017 | 行操作 | 商品支持编辑、低库存商品支持补货；套组支持编辑 | 编辑跳转对应详情或表单；补货打开弹窗 | P0 |
| CS-ESHOP-018 | 新增菜单 | New 菜单提供 Create product、Create bundle、Create auction | Product 和 Bundle 可用；Auction 置灰或占位 | P0 |
| CS-ESHOP-019 | 粉丝视角预览 | 点击 Store preview 打开侧边预览 | 预览只展示当前可见商品 | P1 |

### 5.3 商品创建和编辑

| 编号 | 功能 | 需求说明 | 验收要点 | 优先级 |
| ---- | ---- | -------- | -------- | ------ |
| CS-ESHOP-030 | 商品类型选择 | Physical item 为一期主类型；Digital file 待确认；Auction 后续 | Physical 可进入完整表单；Auction 不进入发布闭环 | P0 |
| CS-ESHOP-031 | 媒体上传 | 上传主图和多角度图片 | 至少支持主图；图片最小尺寸提示按原型展示 | P0 |
| CS-ESHOP-032 | 基础信息 | 商品名称、描述、分类 | 名称和描述必填；描述有最小字数提示 | P0 |
| CS-ESHOP-033 | 规格说明 | 实体商品可添加规格说明 | 支持添加多条规格文本 | P1 |
| CS-ESHOP-034 | 单规格商品 | 填写价格、原价、库存 | 价格必填；库存按库存版本决定是否必填 | P0 |
| CS-ESHOP-035 | 多规格商品 | 可添加选项和值，生成规格组合表 | 每个规格组合独立填写价格、库存、SKU、成本 | P0 |
| CS-ESHOP-036 | 库存版本 | 支持不限量和限量 | 限量时填写总量；当前库存不能超过总量 | P0 |
| CS-ESHOP-037 | 低库存阈值 | 商品详情可设置 low-stock threshold | 库存小于等于阈值时进入低库存提醒 | P1 |
| CS-ESHOP-038 | 配送方式 | Shipping 填重量、尺寸、出货分类、寄件地 | 实体商品选择 Shipping 时必填关键配送字段 | P0 |
| CS-ESHOP-039 | QR 现场取货 | 填写取货说明 | 可以保存取货说明；核销细节待 QR 方案补齐 | P1 |
| CS-ESHOP-040 | 购买限制 | 开启后填写每人最大购买量 | 开启但未填数量时不能发布 | P1 |
| CS-ESHOP-041 | 标签 | 支持输入标签和建议标签 | Enter 添加标签；可删除标签 | P1 |
| CS-ESHOP-042 | 粉丝视角预览 | 表单中打开商品预览 | 预览实时反映名称、描述、价格、媒体 | P1 |
| CS-ESHOP-043 | 保存草稿 | 未满足发布条件时可 Save for later | 生成 Draft 状态商品 | P0 |
| CS-ESHOP-044 | 开始销售 | 满足条件后 Start selling | 生成 Live 状态；若 Show in my shop 开启，则粉丝端可见 | P0 |

### 5.4 商品详情页

| 编号 | 功能 | 需求说明 | 验收要点 | 优先级 |
| ---- | ---- | -------- | -------- | ------ |
| CS-ESHOP-060 | 商品状态展示 | 展示 Live、Low Stock、类型、分类等 badge | badge 与商品实时状态一致 | P0 |
| CS-ESHOP-061 | 内容编辑 | 可编辑标题、主分类、次分类、描述、价格、库存、低库存阈值 | 保存后列表同步更新 | P0 |
| CS-ESHOP-062 | 补货入口 | 商品详情可直接 Restock | 打开同一补货弹窗 | P0 |
| CS-ESHOP-063 | 销售摘要 | 展示 sold units、gross、net after fees | 数据来自 Earnings；无数据时显示空状态或隐藏模块 | P1 |
| CS-ESHOP-064 | 被项目引用提示 | 修改被项目引用的商品时提示影响范围 | 如 Crowdfunding 未上线，可先隐藏或只展示只读提示 | P2 |

### 5.5 套组

| 编号 | 功能 | 需求说明 | 验收要点 | 优先级 |
| ---- | ---- | -------- | -------- | ------ |
| CS-ESHOP-080 | 创建套组 | 填写套组名称并选择商品 | 至少选择 2 个商品后才允许创建 | P0 |
| CS-ESHOP-081 | 商品选择器 | 搜索并添加已有商品 | 已选商品可移除；重复商品不可重复加入 | P0 |
| CS-ESHOP-082 | 套组定价 | 支持固定价；折扣比例字段待确认 | 固定价可保存；折扣模式如未定案则置灰 | P0 |
| CS-ESHOP-083 | 套组限量 | 可填写限量，留空为不限量 | 限量影响套组可售数量 | P1 |
| CS-ESHOP-084 | 套组库存 | 套组库存取成员商品最小库存 | 成员库存变化后套组库存同步变化 | P0 |
| CS-ESHOP-085 | 套组可见性 | 支持 Shop toggle | 关闭后粉丝端不展示该套组 | P0 |

### 5.6 商店设置

| 编号 | 功能 | 需求说明 | 验收要点 | 优先级 |
| ---- | ---- | -------- | -------- | ------ |
| CS-ESHOP-100 | 店面图片 | 上传或更换 cover image 和 logo | 保存后预览同步更新 | P1 |
| CS-ESHOP-101 | 店铺基础资料 | 编辑 shop name、URL slug、bio、currency | URL slug 唯一性由接口校验；bio 最多 200 字 | P0 |
| CS-ESHOP-102 | 商品陈列排序 | 拖拽调整粉丝端商品顺序 | 只展示已上架商品；无商品时展示空状态 | P0 |
| CS-ESHOP-103 | 支付设置 | 展示 Stripe connected 状态 | 一期只读，连接和 payout 由 Earnings 管理 | P1 |
| CS-ESHOP-104 | 配送默认值 | 配置默认寄件地址和免运门槛 | 新建实体商品默认带入寄件地址 | P0 |
| CS-ESHOP-105 | 粉丝视角预览 | 店铺设置页可预览买家看到的店铺 | 预览反映店面资料和可见商品 | P1 |
| CS-ESHOP-106 | 保存和放弃 | 支持 Save changes、Discard | 保存成功后提示；放弃返回 E-Shop | P0 |

### 5.7 补货

| 编号 | 功能 | 需求说明 | 验收要点 | 优先级 |
| ---- | ---- | -------- | -------- | ------ |
| CS-ESHOP-120 | 补货触发 | 从低库存通知、列表行、商品详情打开补货弹窗 | 三处入口行为一致 | P0 |
| CS-ESHOP-121 | 提交补货 | 提交后商品进入 Restocking | 列表状态同步为 Restocking | P0 |
| CS-ESHOP-122 | 到货确认 | Mark received 后增加库存并恢复状态 | 库存刷新；如仍低于阈值继续 Low Stock | P1 |

### 5.8 订单管理

| 编号 | 功能 | 需求说明 | 验收要点 | 优先级 |
| ---- | ---- | -------- | -------- | ------ |
| CS-ESHOP-140 | 订单 KPI | 展示 To ship、Pending、Refunds / disputes、Completed 30d | 数字按当前创作者作用域统计；点击可进入对应筛选 | P0 |
| CS-ESHOP-141 | 订单搜索 | 支持按订单号、买家、商品名搜索 | 搜索结果只返回当前创作者订单 | P0 |
| CS-ESHOP-142 | 状态筛选 | 支持 All、Unpaid、Paid、To ship、Shipped、Completed、Refund / dispute | 筛选与搜索可叠加 | P0 |
| CS-ESHOP-143 | 订单列表 | 展示订单号、买家、品项摘要、金额、状态、日期、Open 操作 | 点击 Open 进入订单详情 | P0 |
| CS-ESHOP-144 | 导出订单 | 导出当前筛选结果 | 导出字段包含订单号、买家、品项、数量、金额、状态、创建时间、履约信息 | P1 |
| CS-ESHOP-145 | 订单金额口径 | 列表和详情展示金额，但不负责计算 | 金额来自 Earnings 或订单结算快照；页面有对账说明 | P0 |
| CS-ESHOP-146 | 订单状态流转 | 支付成功后进入 Paid / To ship，发货后 Shipped，完成后 Completed | 状态流转后列表、KPI、详情同步刷新 | P0 |

### 5.9 订单详情

| 编号 | 功能 | 需求说明 | 验收要点 | 优先级 |
| ---- | ---- | -------- | -------- | ------ |
| CS-ESHOP-160 | 订单头部 | 展示订单号、订单状态、支付状态、创建时间、品项数 | badge 与订单真实状态一致 | P0 |
| CS-ESHOP-161 | 品项和金额 | 展示商品、数量、商品金额、运费、平台费、支付费、净额 | 金额只读，来源标记为 Earnings | P0 |
| CS-ESHOP-162 | 跳转 Earnings | 订单金额区域提供 View in Earnings | 点击可定位到对应交易或至少进入 Earnings 交易明细 | P1 |
| CS-ESHOP-163 | 买家信息 | 展示买家名、粉丝档案入口、寄送地址、联系方式 | 买家资料按隐私规则展示，不泄露其他创作者数据 | P0 |
| CS-ESHOP-164 | 履约信息 | 实体商品填写物流商和 tracking number；QR 取货展示核销状态 | Mark shipped 后订单状态变为 Shipped | P0 |
| CS-ESHOP-165 | 退款和争议入口 | 原型提供 Partial refund、Full refund、Dispute 文案 | 一期如 no refunds，则入口隐藏或置灰；如保留，必须说明收入影响由 Earnings 处理 | P1 |

### 5.10 收入管理

| 编号 | 功能 | 需求说明 | 验收要点 | 优先级 |
| ---- | ---- | -------- | -------- | ------ |
| CS-ESHOP-180 | 周期切换 | 支持 This month、This quarter、This year | KPI、图表、交易明细按周期刷新 | P0 |
| CS-ESHOP-181 | 顶部 KPI | 展示 Gross revenue、Net income、Pending settlement、Available to withdraw | Pending 和 Available 明确区分；Available 是提现资金来源 | P0 |
| CS-ESHOP-182 | Overview | 展示收入趋势、近期交易、收入来源分布 | E-Shop sales 是收入来源之一；可跳转 Transactions | P1 |
| CS-ESHOP-183 | Transactions | 展示 Date、Item、Amount & FX、Status、Fees、Net of fees | 支持 E-Shop、Payouts & refunds 等筛选；可导出 CSV | P0 |
| CS-ESHOP-184 | 交易展开详情 | 展开交易显示 Event ID、费率版本、单笔 waterfall | 支持复制 Event ID；金额拆解可追踪平台费和支付费 | P1 |
| CS-ESHOP-185 | Manual entry | 可补登外部或未同步收入 | 标记 Manual · unverified，不计入 Available、payout、tax | P2 |
| CS-ESHOP-186 | Breakdown | 展示本期 Earnings waterfall 和按项目拆解 | 只计入 settled income；可追踪到交易、商品或方案 | P1 |
| CS-ESHOP-187 | Payouts | 展示提现银行、可提现余额、提款历史、净利池和 refund reserve | 没有可用银行账户时不能发起提现；提现为不可逆操作需二次确认 | P1 |
| CS-ESHOP-188 | Tax documents | 展示税务文件列表、年份/季度筛选、支持地区说明 | 若一期不支持自动税表，保留只读占位和下载年度收入摘要 | P2 |
| CS-ESHOP-189 | 退款/争议金额影响 | refund / dispute 交易冻结或扣减 Available | 订单管理不处理金额影响，只展示 Earnings 结果 | P1 |

## 6. 数据模型草案

前端类型建议放在 `src/api/<domain>.ts`，业务层不要扩散 `any`。

| 对象 | 关键字段 |
| ---- | -------- |
| CreatorProfile | `id`、`userId`、`displayName`、`handle`、`avatarUrl`、`hasShop`、`status` |
| Shop | `id`、`creatorId`、`handle`、`name`、`bio`、`currency`、`coverUrl`、`logoUrl`、`publishStatus` |
| Product | `id`、`shopId`、`type`、`title`、`description`、`category`、`status`、`visibility`、`price`、`originalPrice`、`stock`、`lowStockThreshold` |
| ProductVariant | `id`、`productId`、`optionValues`、`price`、`stock`、`totalQuantity`、`sku`、`cost` |
| ProductMedia | `id`、`productId`、`url`、`kind`、`sortOrder` |
| Bundle | `id`、`shopId`、`name`、`items`、`pricingType`、`price`、`discountPercent`、`quantityLimit`、`status`、`visibility` |
| StoreSettings | `shopId`、`displayOrder`、`shippingFrom`、`freeShippingThreshold` |
| StockMovement | `id`、`productId`、`variantId`、`type`、`quantity`、`status` |
| Order | `id`、`shopId`、`orderNo`、`buyerId`、`status`、`paymentStatus`、`fulfillmentStatus`、`totalAmount`、`createdAt` |
| OrderItem | `id`、`orderId`、`productId`、`variantId`、`bundleId`、`titleSnapshot`、`quantity`、`unitPrice`、`subtotal` |
| Fulfillment | `id`、`orderId`、`method`、`carrier`、`trackingNumber`、`shipTo`、`qrTokenStatus`、`shippedAt`、`completedAt` |
| RevenueEvent | `id`、`creatorId`、`shopId`、`orderId`、`source`、`grossAmount`、`fees`、`netAmount`、`status`、`rateVersion`、`settledAt` |
| Payout | `id`、`creatorId`、`bankAccountId`、`amount`、`currency`、`status`、`requestedAt`、`paidAt` |

状态枚举建议：

- Product status：`draft`、`live`、`hidden`、`low_stock`、`sold_out`、`restocking`
- Visibility：`visible`、`hidden`
- Product type：`physical`、`digital`、`auction`
- Fulfillment method：`shipping`、`qr_pickup`
- Bundle pricing type：`fixed`、`percent_off`
- Order status：`unpaid`、`paid`、`to_ship`、`shipped`、`completed`、`refund_dispute`
- Revenue event status：`pending`、`available`、`paid`、`payout_requested`、`failed`、`disputed`、`manual_unverified`

## 7. API 拆解

接口命名只表达前端所需能力，具体路径以后端契约为准。

| 能力 | 接口需求 | 优先级 |
| ---- | -------- | ------ |
| 获取当前创作者店铺 | 查询 creator profile 和 shop | P0 |
| 商品列表 | 支持 tab、搜索、状态筛选、分页 | P0 |
| 商品详情 | 查询商品、媒体、规格、库存、销售摘要 | P0 |
| 创建商品 | 保存草稿或开始销售 | P0 |
| 更新商品 | 编辑内容、价格、库存、配送、可见性 | P0 |
| 切换商品可见性 | Shop toggle on/off | P0 |
| 补货 | 创建补货记录、确认到货 | P0 |
| 套组列表 | 查询套组及成员摘要 | P0 |
| 创建和更新套组 | 保存成员、价格、限量、可见性 | P0 |
| 商店设置 | 查询和保存店面资料、陈列排序、配送默认值 | P0 |
| 上传 | 上传商品图、cover、logo | P0 |
| 预览数据 | 获取粉丝端预览所需商品和店面资料 | P1 |
| 订单列表 | 查询订单 KPI、列表、搜索、状态筛选、分页 | P0 |
| 订单详情 | 查询订单品项、金额快照、买家、履约、退款/争议状态 | P0 |
| 更新履约 | 保存物流商、tracking number、标记出货、QR 核销状态 | P0 |
| 订单导出 | 导出当前筛选范围订单 | P1 |
| 收入总览 | 查询周期 KPI、趋势、收入来源、近期交易 | P0 |
| 交易明细 | 查询交易列表、来源筛选、展开详情、Event ID、费率版本 | P0 |
| 收益拆解 | 查询 waterfall、按项目/商品追踪 | P1 |
| 提现 | 查询提现银行、可提领余额、发起提现、提现历史 | P1 |
| 税务文件 | 查询税务文件和年度收入摘要 | P2 |

## 8. 开发任务拆解

### P0：主链路骨架

- 新增 e-shop 路由和页面骨架。
- 接入创作者上下文和 shop 查询。
- 实现 Products/Bundles/Auctions tab。
- 实现商品列表、套组列表、搜索、状态筛选、低库存通知。
- 实现 Shop toggle、编辑跳转、补货入口。
- 实现新增商品和新增套组入口。
- 实现订单管理列表、订单 KPI、搜索、状态筛选和订单详情只读骨架。
- 实现 Earnings 顶部 KPI 和 e-shop 交易明细最小闭环。

### P1：商品和套组闭环

- 实现实体商品创建表单。
- 实现商品详情编辑。
- 实现多规格表格、库存、配送和 QR pickup 表单。
- 实现保存草稿和开始销售。
- 实现套组创建、商品选择器、固定价、限量和创建。

### P2：商店设置和预览

- 实现 store settings 页面。
- 实现店面资料、URL slug、bio、currency、cover、logo。
- 实现商品陈列排序。
- 实现 shipping defaults。
- 实现 E-Shop 和 Store settings 的粉丝视角预览。
- 实现订单履约操作：填写物流、Mark shipped、QR 取货状态展示。
- 实现 Earnings Overview、Breakdown 和 Payouts。

### P3：联调和验收

- 接真实 API。
- 补齐 loading、empty、error 状态。
- 浏览器验证核心流程。
- 根据 UAT 缺陷修复。
- 补齐导出、税务文档占位、退款/争议入口策略。

## 9. 验收场景

1. Admin 进入某创作者作用域后，只看到该创作者的商品和套组。
2. 商品列表可按名称搜索，可按状态筛选。
3. 低库存商品在顶部通知展示，并可打开补货流程。
4. 新建实体商品，填写必填项后可以 Start selling。
5. 未满足发布条件时只能保存草稿，不能开始销售。
6. 多规格商品每个规格组合都能独立填写价格和库存。
7. Shop toggle 关闭后，商品状态变为 Hidden，粉丝端预览不展示。
8. 补货提交后状态变为 Restocking，到货确认后库存更新。
9. 套组少于 2 个成员时不能创建，创建后库存取成员最小库存。
10. 商店设置保存后，粉丝视角预览能看到更新后的店名、简介、封面和商品排序。
11. Auctions tab 仅展示后续版本占位，不进入创建流程。
12. 买家支付成功后，订单出现在订单管理列表，并同步更新 To ship KPI。
13. 订单详情展示品项、买家、履约和金额拆解；金额区域能跳转 Earnings。
14. Mark shipped 后订单状态从 To ship 更新为 Shipped。
15. Earnings 的 Transactions 能筛选 E-Shop 交易，并展示对应订单收入事件。
16. Pending settlement 不计入 Available to withdraw；只有 Available 可以发起 payout。
17. Manual entry 标记为 unverified，不进入可提领和税务文件。

## 10. 风险和待确认

- Digital file 是否进入一期：需求页和原型不一致。
- QR pickup 具体核销方案未定。
- Commerce module API spec 未完全确认，可能影响字段和状态映射。
- Stripe Connect 和平台抽佣比例仍有业务决策项。
- 退款/争议入口与 no refunds in v1 存在范围冲突，需要产品确认展示策略。
- Earnings 是交付完整模块，还是只做 e-shop 对账和提现最小闭环，需要产品确认。
- 商品被项目引用的提示依赖 Crowdfunding 或项目模块数据，可能需要后续联动。
