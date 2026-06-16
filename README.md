# Creator Studio

当前重点项目：Ztor Creator Studio e-shop 第一期。

## e-shop 当前进度

最后更新：2026-06-16

原型入口：

- [商品管理](https://ztor-v2-creator-studio.vercel.app/e-shop.html)
- [订单管理](https://ztor-v2-creator-studio.vercel.app/orders.html)
- [商店设置](https://ztor-v2-creator-studio.vercel.app/store-settings.html)
- [收入管理](https://ztor-v2-creator-studio.vercel.app/earnings.html)

关联文档：

- [业务流程图](./docs/ztor-eshop-business-flow.md)
- [需求拆解文档](./docs/ztor-eshop-requirements-breakdown.md)


### Checklist

默认不预设状态，项目组每周手动勾选和调整。

- [ ] 项目文档和范围
  - [ ] 文档产出
    - [ ] 业务流程图文档已生成。
    - [ ] 需求拆解文档已生成。
    - [ ] 每周项目跟进 checklist 已生成。
  - [ ] 一期范围决策
    - [ ] 确认一期范围：Physical + Bundles only，Digital / Auction 是否隐藏、置灰或保留占位。
    - [ ] 确认 Auctions 是否仅保留后续版本占位。
    - [ ] 确认 Refund / dispute 一期展示策略。
    - [ ] 确认 Earnings 是完整模块还是 e-shop 最小对账闭环。
    - [ ] 确认 QR pickup token、刷新、核销和异常补核销规则。
    - [ ] 确认 Stripe / payout / 平台抽成 / 结算币别口径。
- [ ] 创作者上下文和权限
  - [ ] 创作者作用域
    - [ ] 建立 creator / shop 作用域。
    - [ ] 商品、套组、订单、收入、商店设置数据按创作者隔离。
  - [ ] 管理入口
    - [ ] Admin 先选择创作者，再进入该创作者店铺管理视图。
    - [ ] Creator 自助 SSO 明确为 Phase 2。
    - [ ] 未选择创作者时限制进入店铺管理功能。
- [ ] 商品管理
  - [ ] 商品列表
    - [ ] 商品管理路由已有页面骨架：`/items`。
    - [ ] 商品管理目标路由是否从 `/items` 调整为 `/e-shop` 或保持当前路由。
    - [ ] 商品列表接入列表接口：`apiGetShopItemList`。
    - [ ] 商品列表展示图片、商品名、分类、价格、状态、库存、Shop 开关、操作。
    - [ ] 商品列表支持分页。
    - [ ] 商品列表支持搜索。
    - [ ] 商品列表支持状态筛选。
    - [ ] 商品列表展示低库存提示条。
    - [ ] 商品列表支持 Products / Bundles / Auctions tabs。
    - [ ] 商品列表粉丝视角预览面板。
  - [ ] 新建商品
    - [ ] 新建商品路由页面骨架：`/create-product`。
    - [ ] 新建商品 UI 覆盖 Physical / Digital / Auction 类型选择。
    - [ ] 新建商品 UI 覆盖媒体上传。
    - [ ] 新建商品 UI 覆盖基础信息、分类、描述。
    - [ ] 新建商品 UI 覆盖规格说明。
    - [ ] 新建商品 UI 覆盖单规格价格和库存。
    - [ ] 新建商品 UI 覆盖多规格价格、库存、SKU、成本。
    - [ ] 新建商品 UI 覆盖 Shipping 配置。
    - [ ] 新建商品 UI 覆盖 QR pickup 配置。
    - [ ] 新建商品 UI 覆盖购买限制。
    - [ ] 新建商品 UI 覆盖标签。
    - [ ] 新建商品 UI 覆盖 Show in my shop。
    - [ ] 新建商品页发布 readiness 检查 UI。
    - [ ] 商品创建保存接口：Save draft。
    - [ ] 商品创建发布接口：Start selling。
    - [ ] 商品图片、cover、digital file 上传接口。
  - [ ] 商品详情和编辑
    - [ ] 商品详情真实页面：`/items/$id/detail`。
    - [ ] 商品编辑真实页面：`/items/$id/edit`。
    - [ ] 商品行操作：编辑、查看店铺展示、下架。
  - [ ] 上架和库存
    - [ ] Shop toggle 接入真实可见性 mutation。
    - [ ] 补货弹窗。
    - [ ] 补货提交。
    - [ ] Mark received。
- [ ] 套组管理
  - [ ] 套组列表
    - [ ] Bundles tab 占位空状态。
    - [ ] Bundles 真实列表。
    - [ ] 套组 Shop toggle。
  - [ ] 创建套组
    - [ ] Create bundle 页面。
    - [ ] Create bundle 接口。
    - [ ] 套组商品选择器。
  - [ ] 套组定价和库存
    - [ ] 套组固定价。
    - [ ] 套组折扣价策略。
    - [ ] 套组限量配置。
    - [ ] 套组库存按成员商品最小可售库存计算。
- [ ] 商店设置
  - [ ] 店面资料
    - [ ] 商店设置页面。
    - [ ] 店面 cover / logo。
    - [ ] 店名。
    - [ ] URL slug。
    - [ ] 店铺简介 bio。
    - [ ] 店铺币别 currency。
  - [ ] 商店运营配置
    - [ ] 商品陈列排序。
    - [ ] Stripe connected 状态展示。
    - [ ] 默认寄件地址。
    - [ ] 免运门槛。
  - [ ] 预览和保存
    - [ ] 商店设置粉丝视角预览。
    - [ ] Save changes。
    - [ ] Discard。
- [ ] 订单管理
  - [ ] 订单列表
    - [ ] 订单管理真实列表页面：`/orders`。
    - [ ] 订单 KPI：To ship、Pending、Refunds / disputes、Completed 30d。
    - [ ] 订单搜索：订单号、买家、商品名。
    - [ ] 订单状态筛选。
    - [ ] 订单列表字段：订单号、买家、品项、金额、状态、日期、Open。
  - [ ] 订单详情
    - [ ] 订单详情真实页面：`/orders/$id/detail`。
    - [ ] 订单详情品项和金额。
    - [ ] 订单详情买家信息、地址、联系方式。
    - [ ] 订单金额跳转 Earnings。
  - [ ] 履约和核销
    - [ ] 订单履约：carrier、tracking number、Mark shipped。
    - [ ] QR pickup 订单核销状态。
    - [ ] QR pickup 异常处理入口。
  - [ ] 导出和对账
    - [ ] 订单导出。
    - [ ] 订单金额对账说明：金额来自 Earnings，不重新计算。
- [ ] 收入管理
  - [ ] 收入总览
    - [ ] 收入管理页面路由。
    - [ ] Earnings 顶部 KPI：Gross、Net、Pending、Available。
    - [ ] 周期切换：month / quarter / year。
    - [ ] Overview：收入趋势。
    - [ ] Overview：近期交易。
    - [ ] Overview：收入来源分布。
  - [ ] 交易明细
    - [ ] Transactions：E-Shop 筛选。
    - [ ] Transactions：交易列表。
    - [ ] Transactions：交易展开详情。
    - [ ] Transactions：Event ID。
    - [ ] Transactions：费率版本。
    - [ ] Transactions：CSV 导出。
  - [ ] 收入拆解
    - [ ] Breakdown：本期 waterfall。
    - [ ] Breakdown：按项目 / 商品追踪。
    - [ ] Refund / dispute 金额冻结、扣减或恢复口径。
  - [ ] 提现和税务
    - [ ] Payouts：银行账户。
    - [ ] Payouts：可提领余额。
    - [ ] Payouts：Request payout。
    - [ ] Payouts：提现历史。
    - [ ] Manual entry：unverified，不计入 Available / payout / tax。
    - [ ] Tax documents 或年度收入摘要占位。
- [ ] 接口和数据联调
  - [ ] 基础和权限接口
    - [ ] creator profile / shop 查询。
    - [ ] 权限校验。
  - [ ] 商品和商店接口
    - [ ] 商品列表 / 详情 / 保存接口。
    - [ ] Shop toggle 接口。
    - [ ] 库存和补货接口。
    - [ ] 套组列表 / 创建 / 更新接口。
    - [ ] 商店设置查询 / 保存接口。
    - [ ] 上传接口。
  - [ ] 订单和收入接口
    - [ ] 订单列表 / 详情接口。
    - [ ] 履约更新接口。
    - [ ] 收入总览接口。
    - [ ] 交易明细接口。
    - [ ] 提现接口。
  - [ ] 通用状态
    - [ ] loading / empty / error 状态补齐。
- [ ] 验收和发布
  - [ ] 主链路浏览器验证
    - [ ] 浏览器验证商品主链路。
    - [ ] 浏览器验证套组主链路。
    - [ ] 浏览器验证商店设置主链路。
    - [ ] 浏览器验证订单主链路。
    - [ ] 浏览器验证收入主链路。
  - [ ] 业务口径验证
    - [ ] Pending 不可提现口径验证。
    - [ ] 创作者作用域隔离验证。
  - [ ] 发布准备
    - [ ] UAT 缺陷收敛。
    - [ ] 上线回滚方案明确。

