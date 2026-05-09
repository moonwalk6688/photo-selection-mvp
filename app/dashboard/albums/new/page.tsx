import { createAlbumAction } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export default function NewAlbumPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-sm text-muted">新建客户相册</p>
      <h1 className="mt-1 text-2xl font-semibold text-ink">创建选片链接</h1>

      <form action={createAlbumAction} className="mt-6 rounded-lg border border-line bg-white p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            客户名称
            <Input name="client_name" className="mt-2" placeholder="陈宝宝满月宴" required />
          </label>
          <label className="block text-sm font-medium">
            拍摄类型
            <Input name="shoot_type" className="mt-2" placeholder="宝宝宴 / 婚礼 / 活动" required />
          </label>
          <label className="block text-sm font-medium">
            拍摄日期
            <Input name="shoot_date" className="mt-2" type="date" />
          </label>
          <label className="block text-sm font-medium">
            最多可选
            <Input name="max_select_count" className="mt-2" type="number" min={1} defaultValue={30} />
          </label>
          <label className="block text-sm font-medium sm:col-span-2">
            访问密码
            <Input name="access_password" className="mt-2" placeholder="可选" />
          </label>
          <label className="block text-sm font-medium sm:col-span-2">
            相册说明
            <Textarea name="description" className="mt-2" placeholder="选片说明、精修数量、注意事项" />
          </label>
        </div>
        <label className="mt-5 flex items-center gap-3 text-sm">
          <input name="allow_resubmit" type="checkbox" className="h-4 w-4 accent-ink" />
          允许客户提交后再次修改
        </label>
        <Button className="mt-6 w-full sm:w-auto" type="submit">
          创建相册
        </Button>
      </form>
    </div>
  );
}
