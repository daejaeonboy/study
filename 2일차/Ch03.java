public class Ch03 {
    public static void main (String[] args) {
        int number = 10;
        int i = number;
        int result = i++;

        System.out.println(number);
        System.out.println(i);
        System.out.println(result);

        boolean isLogin = false;

        if (!isLogin) {
        System.out.println("로그인이 필요합니다.");
        }

        int a = 10;
        int b = 20;
            
        System.out.println(a < b);
        System.out.println(a > b);
        System.out.println(a == b);
        System.out.println(a != b);

        int number2 = 10;
        number2 += 5;


        System.out.println(number2);

        int number3 = 20;
        number3 += 10;
        number3 *= 2;

        System.out.println(number3);

        int result1 = 10 + 2 * 3;
        int result2 = (10 + 2) * 3;

        System.out.println(result1);
        System.out.println(result2);
    }
}
