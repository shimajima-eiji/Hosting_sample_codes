import java.util.*;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Random;

/**
 * じゃんけん処理を集約したクラス
 */ 
final class Modules {
    
    /**
     * キー入力後の処理を束ねる
     * 入力値はStringで受け取り、指定した範囲においてintに直す
     * @return -1 〜 max
     */ 
    public static int input(String input, int max) {
        int yourHand;
        try {
            yourHand = Integer.parseInt(input);
            if(1 > yourHand || yourHand > max) {
                yourHand = 0;
            }
        } catch(NumberFormatException e) {
          yourHand = 0;
        }
        return yourHand-1;
    }
    public static int input(String input) {
        return input(input, 3);
    }

    /**
     * ランダムに手を返す
     * この辺りは後で差し替えそうなので関数化
     */ 
    public static int setHand() {
        Random rnd = new Random();
		return rnd.nextInt(3);
    }
    
    /**
     * 数値を文字に直して返す
     */ 
    public static String getHand(int index) {
        String[] HANDS = {"グー", "チョキ", "パー"};
        return HANDS[index];
    }

    /**
     * 手を集めて勝敗・あいこを判定する。
     * 勝った手を返すので、呼び出し元で制御を継続する
     * @return: -1　〜　2
     */
    public static int battle(int... hands) {
        int[] results = {0,0,0};
        for(int i=0; i<hands.length; i++) {
            results[hands[i]]++;
        }
        
        // 全ての手が出ているか、全て同じ手ならもう一度
        if(results[0] > 0 && results[1] > 0 && results[2] > 0
        || results[0] == hands.length
        || results[1] == hands.length
        || results[2] == hands.length
        ) {
            return -1;
        }

        return (results[0] == 0)
        ? 1
        : (results[1] == 0)
          ? 2 : 0;
    }
    
}

public class Main {
    public static void main(String[] args) throws Exception {
        /**
         * 本来はBufferReaderも外部クラスに投げたいが、JVMの仕様かエラーになってしまうので、
         * 諦めて入力処理はすべてmainメソッドで責任を持って、可能な限り外部に投げる想定
         */
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        int wins[] = {0,0};

       // Your code here!
        System.out.println("じゃんけんの手を入力してください（半角数字）");
        System.out.println("1．グー：2．チョキ：3．パー");
        String inputKey = reader.readLine();
        int yourHand = Modules.input(inputKey);
        if(yourHand == -1) {
            System.out.println("入力が不正のため、処理を中断しました");
            return;
        }

        // System.out.println(Modules.getHand(Modules.setHand()));
        System.out.println(Modules.getHand(Modules.battle(yourHand, Modules.setHand())));
        
    }
}
