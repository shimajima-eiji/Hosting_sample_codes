/**
* Constructor
*/

// htmlの要素IDを変えたらここを変更する
const ids = {
  "next": "next",
  "input": "typing_game_input",
  "button": "start",
  "sec": "second",
  "min": "minute",
  "unit": "unit",
  "miss": "miss",
  "rap": "rap",
  "combo": "combo",
  "max_combo": "max_combo",
  "score": "score",
  "hiscore": "hi-score",
  "result": "result",
  "cookie": "hiscore",  // 例外的に、セッションキー（ハイスコア）を指定
};

//
const params = {
  count: 0, // 現在の周回
  loop: 1,  // 10回繰り返す
  score: 0, // スコア
  combo: 0, // スコアボーナス
  max_combo: 0, // コンボボーナス
  miss: 0,  // ミスタイプ
  down: 10, // ミス一回のマイナススコア
  bonus: 100, // コンボボーナスの掛け率
  hiscore:    // 前回のハイスコア。cookieを使用
    parseInt( Cookies.get( ids.cookie ) ) > 0 ? parseInt( Cookies.get( ids.cookie ) ) : 0,
  keys: {}  // リザルトで間違えたキーを表示する
};

// ここを変えてはいけない
const system = {
  code: {
    now: 97,
    a: 97,
    z: 122,
  },
  end: true, // exit関数
  time: {
    all: 0, // 全時間
    all_id: null,
  },
  interval: 1000, // ミリ秒
  clear_message: "クリアーおめでとう！",
  style: {
    input_disabled: "disabled",
    unit_display: "inline",
    result_display: "block",
  },
  trigger: {
    input: "input",
    start: "click"
  }
};

/**
* Modules
* ライブラリはどこからでも呼び出せるもの
* ラッパーにはController内の長過ぎる処理をまとめて集約している
*/
// Todo: IDとidsオブジェクトを比較して、存在しないIDの場合エラーを通知する
const __LIBRARY = {
  get: ( id ) => document.getElementById( id ),
  set: ( id, value ) => document.getElementById( id ).innerHTML = value,
  cookie: ( key, value ) => Cookies.set( key, value ),
  code: ( code = system.code.now ) => String.fromCharCode( code ),
}

const __WRAPPER = {
  time: {
    sec: __LIBRARY.get( ids.sec ),
    min: __LIBRARY.get( ids.min ),
    unit: __LIBRARY.get( ids.unit ),
  },
  trigger: ( id, action, func ) => __LIBRARY.get( id ).addEventListener( action, func )
};

// タイマー処理
__WRAPPER.time.func = () =>
{
  const sec2min = 60;  // 60秒
  system.time.all++;
  if ( system.time.all % sec2min == 0 )
  {
    __WRAPPER.time.min.innerHTML = parseInt( system.time.all / sec2min );
    __WRAPPER.time.unit.style.display = system.style.unit_display;
  }
  __WRAPPER.time.sec.innerHTML = system.time.all % sec2min;
}

/**
 * inputで成功した場合に次のキーを設定するオリジナル処理を切り出し
 */
__WRAPPER.next_key = () =>  // inputへ
{
  // 周回が終了すると実行
  const end = () =>
  {
    // ゲームが終了すると実行
    const finish = () =>
    {
      clearInterval( system.time.all_id );
      __LIBRARY.get( ids.input ).disabled = system.style.input_disabled;
      __LIBRARY.set( ids.next, system.clear_message );
      params.score += parseInt( params.combo * params.bonus / system.time.all )
      __WRAPPER.table();  // テーブル処理。多いので切り出し
      return system.end;
    }

    /**
     * end　実行
     */
    params.count++;
    __LIBRARY.set( ids.rap, params.count + 1 );
    if ( params.count == params.loop ) return finish();
  }

  /**
   * next_key 実行
   */
  system.code.now++;
  if ( system.code.now > system.code.z )
  {
    system.code.now = system.code.a;
    return end();
  }
}

/**
 * finishでゲームが終了した時にテーブルを作成する処理を集約
 */
__WRAPPER.table = () =>
{
  // table作成
  /**
   * 関数
   */
  let c = ( tag ) => document.createElement( tag );
  let a = ( parent, child ) => parent.appendChild( child );
  let t = ( text ) => document.createTextNode( text );  // add_columnを何度も呼び出すので外出し
  let add_column = ( tr, column, value ) =>
  {
    column = c( column );
    a( column, t( value ) );
    a( tr, column );
  }

  /**
   * 定義
   */
  const table = c( "table" );
  const thead = c( "thead" );
  const tbody = c( "tbody" );

  /**
   * theadをtableに格納するまで
   */
  let tr = c( "tr" );
  add_column( tr, "th", "目標キー" );
  add_column( tr, "th", "ミスした回数" );
  add_column( tr, "th", "ミスしたキー" );
  a( thead, tr );
  a( table, thead );

  /**
   * tbodyをtableに格納するまで
   */
  let object;
  Object.keys( params.keys ).sort().map( ( key ) =>
  {
    object = params.keys[ key ];

    tr = c( "tr" );
    add_column( tr, "td", key );
    add_column( tr, "td", object.all );
    delete object.all;  // 全キーを表示させるため、ミスした回数として持っていたallはキーではないため捨てる
    add_column( tr, "td", Object.keys( object ).sort() );
    a( tbody, tr );
  } )
  a( table, tbody );

  /**
   * 作ったtableをresultに配置する
   */
  __LIBRARY.get( ids.result ).style.display = system.style.result_display;
  let result = __LIBRARY.get( ids.result );
  a( result, table );
};

/**
 * inputで失敗した場合に間違えたキーを保存するオリジナル処理を切り出し
 */
__WRAPPER.misskey = () =>
{
  let next = __LIBRARY.get( ids.next ).innerHTML;
  let target = params.keys[ next ];

  if ( !target )
  {
    params.keys[ next ] = {};
    target = params.keys[ next ];
    target.all = 0;
  }
  target.all++;

  let key = __LIBRARY.get( ids.input ).value;
  ( target[ key ] )
    ? target[ key ]++
    : target[ key ] = 1;
}

/**
 * Controller
 * イベントリスナーの呼び出し先をcontroller.(func)で集約するもの
 * 独特の処理をまとめたため太っているが、意味単位でラッパーに送っている
 */
const controller = {
  start: () =>  // 開始ボタン
  {
    clearInterval( system.time.all_id );
    /**
     * タイマーを止める
     * 画面左側:
     *   周回を戻す
     *   文字をaから
     *   inputに入力できるようにする
     *   フォーカスを当てる
     *
     * 画面右側:
     *   スコアを戻す
     *   タイムを戻す（分の表示も戻す）
     *   ミスを戻す
     *   コンボを戻す
     *   最大コンボを戻す
     *
     * タイマーを再セットして開始
     */
    system.code.now = system.code.a;
    let _e = __LIBRARY.get( ids.input );
    _e.placeholder = __LIBRARY.code( system.code.a );
    _e.disabled = undefined;

    __LIBRARY.set( ids.rap, 1 );
    __LIBRARY.set( ids.next, __LIBRARY.code( system.code.a ) );

    _e.focus();



    params.score = 0;
    __LIBRARY.set( ids.score, params.score );

    system.time.all = 0;
    __LIBRARY.set( ids.sec, system.time.all );
    __LIBRARY.set( ids.min, null );
    __LIBRARY.get( ids.unit ).style.display = "none";

    params.miss = 0;
    __LIBRARY.set( ids.miss, params.miss );

    params.combo = 0;
    __LIBRARY.set( ids.combo, params.combo );

    params.max_combo = 0;
    __LIBRARY.set( ids.max_combo, params.max_combo );

    system.time.all_id = setInterval( system.time.all_id, system.interval );
  },

  input: ( element ) =>  // タイピング入力
  {
    /**
     * キーが押されたら（押し続けられたら）発火
     *
     * 正解時とミス時で挙動が大幅に変わるため、大枠は
     */
    let value = element.data;
    let next = __LIBRARY.get( ids.next );
    let input = __LIBRARY.get( ids.input );

    /**
     * 正解:
     *   スコアを増やす
     *   コンボをつなげる
     *   最大コンボを更新する
     *   クリアーではない場合は次のキーを設定
     */
    if ( next.innerHTML == value )
    {
      params.score += params.combo;

      params.combo++;
      if ( params.max_combo < params.combo )
      {
        params.max_combo = params.combo;
        __LIBRARY.set( ids.max_combo, params.max_combo );
      }

      if ( !__WRAPPER.next_key() )
      {
        input.placeholder = __LIBRARY.code();
        next.innerHTML = __LIBRARY.code();
      }
    }

    /**
     * タイプミス:
     *   スコアを減らす
     *   コンボを消す
     *   ミスを増やす
     *   どんなタイプミスをしたか見える化
     */
    else
    {
      params.score -= params.down;

      params.combo = 0;

      params.miss++;
      __LIBRARY.set( ids.miss, params.miss );

      // 間違えたキーの情報を収集
      input.placeholder = value;  // タイプミス時は何で間違えたか見えるように更新する
      __WRAPPER.misskey_f();
    }

    /**
     * 入力値は消す
     * スコアを更新する
     * ハイスコアを更新する場合は更新する
     * コンボを更新する
     */
    input.value = "";
    __LIBRARY.set( ids.score, params.score );
    if ( params.score > params.hiscore )
    {
      params.hiscore = params.score;
      __LIBRARY.set( ids.hiscore, params.hiscore );
      __LIBRARY.cookie( ids.cookie, params.hiscore );
    }
    __LIBRARY.set( ids.combo, params.combo );
  }
}
/**
 * Trigger
 * イベントリスナーの追加はここから。
 * system.triggerとcontrollerは対応させる。
 */
__WRAPPER.trigger( ids.input, system.trigger.input, controller.input );
__WRAPPER.trigger( ids.button, system.trigger.start, controller.start );

/**
 * main
 * 前提処理がある場合はここに集約する
 */
__LIBRARY.set( ids.hiscore, params.hiscore );  // ハイスコアを格納

