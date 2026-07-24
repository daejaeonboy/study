import java.util.Arrays;

public class Main {
	
	public static void main(String[] args) {
		int x = 1;
		double y = 2;
		double result = x / y;
		System.out.println(result);

		int age = 30;
		boolean hasParent = true;

		if (age >= 20 || hasParent == true) {
 	   		System.out.println("입장할 수 있습니다.");
		}	else { 
			System.out.print("입장할 수 없습니다. ");
		}

		int score = 50;
		boolean hasCoupon = true;
		if ( score >= 80 || hasCoupon == true) {
			System.out.println("혜택을 받을 수 없습니다.");	
		} else {
			System.out.println("혜택을 받을 수 없습니다."); 
		}

		boolean isLogin = true;

		if(!isLogin){
			System.out.println("로그인이 필요합니다.");
		}

		else{

			for (int i = 1; i <= 5; i++) 
			System.out.println(i);
		}
		
		int sum = 0;

		for (int i = 1; i <= 5; i++) { 
			sum = sum + i;
		
		}
		System.out.println(sum);

		int i = 0;

        while (i <= 5) {
			i++;
			
			if (i==4) {
				break;
			}

			if( i == 1){
				continue;
			}

			System.out.println(i);

			int[] scores = {80,90,100};
			System.out.println(scores[0]);
			System.out.println(scores[1]);
			System.out.println(scores[2]);
			System.out.println(scores.length);
        }
		
		int number = 10;

		number -= 3;

		System.out.println(number);

		int age2 = 20; 
		String result2 = age2 >= 20 ? "성인" : "미성년자";
		System.out.println(result2);
		System.out.println(5 + 5 * 2);

		int[] numbers = {10, 20, 30};
		numbers[0] = 100;
		System.out.println(numbers[0]);

		int[] number3 = new int[3];
		number3[0] = 10;
		number3[1] = 11;
		number3[2] = 12;

		System.out.println(Arrays.toString(number3));


	}
}
