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

/**
 * 商品編集の保存後などに、対象要素(商品名見出しなど)がビューポート最上部に
 * 来る位置までスクロールする。一覧の並び替えや先頭復帰とは無関係に、
 * その要素だけをピンポイントで最上部へ合わせたい場合に使う。
 * .app-shellはmin-height指定でコンテンツに応じて伸び、実際にスクロールしているのは
 * window/documentElement側であるため(scrollAppContentToTop参照)、
 * window.scrollYを基準に絶対位置を計算する。
 * refをそのまま受け取り、rAF発火時点で.currentを読み直すことで、呼び出し後に
 * 対象要素が(検索条件から外れる等で)アンマウントされていれば安全に何もしない。
 */
export function scrollElementToViewportTop(
  ref: { current: Element | null },
  topOffset = 0
): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const target = ref.current;
      if (!target) return;
      const top = window.scrollY + target.getBoundingClientRect().top - topOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}
