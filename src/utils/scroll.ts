/** 商品追加・編集の保存後に、商品比較画面の一覧を先頭までスクロールして戻す */
export function scrollAppContentToTop(): void {
  document.querySelector('.app-content')?.scrollTo({ top: 0, behavior: 'smooth' });
}
