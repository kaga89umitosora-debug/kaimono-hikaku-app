/**
 * 商品追加・編集の保存後などに、画面の一覧を先頭までスクロールして戻す共通処理。
 * .app-contentはCSS上overflow-y:autoだが、実機では.app-shell/#rootの高さが
 * コンテンツに応じて伸びるため、実際にスクロールしているのはブラウザの
 * ドキュメント側(window/documentElement)であることが多い。そのため対象を
 * 一つに決め打ちせず、候補となるスクロールコンテナすべてに対してtopへ戻す。
 * targetを渡した場合はscrollIntoViewで実際のスクロール祖先を辿らせる。
 * 呼び出し元のstate更新・モーダルのクローズによる再描画が完了してから
 * 実行する必要があるため、二重のrequestAnimationFrameで描画完了を待つ。
 */
export function scrollAppContentToTop(target?: Element | null): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      target?.scrollIntoView({ behavior: 'auto', block: 'start' });
      document.querySelector('.app-content')?.scrollTo({ top: 0, behavior: 'auto' });
      window.scrollTo({ top: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  });
}
