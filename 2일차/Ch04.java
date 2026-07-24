public class Ch04 {
    public static void main(String[] args) {
        example();
        example1();
        example2();
        example3();
        example4();
    }

    public static void example() {
        System.out.println("----------example");
        int score = 90;

        if (score >= 80) {
            System.out.println("합격입니다.");
        } else {
            System.out.println("불합격입니다.");
        }
    }

    public static void example1() {
        System.out.println("----------example");
        int score = 90;

        if (score >= 80) {
            System.out.println("합격입니다.");
        } else {
            System.out.println("불합격입니다.");
        }
    }

    public static void example2() {
        System.out.println("----------example");
        int score = 70;
        
        if(score >=90){
            System.out.println("A등급입니다.");
        } else if(score >=80){
            System.out.println("B등급입니다.");
        } else if(score >= 60){
            System.out.println("C등급입니다.");
        } else{
            System.out.println("D등급입니다.");
        }
    }

    public static void example3() {
        System.out.println("----------example");
        int menu = 2;

        switch (menu) {
        case 1:
            System.out.println("커피를 선택했습니다.");
            break;

        case 2:
            System.out.println("주스를 선택했습니다.");
            break;

        case 3:
            System.out.println("물을 선택했습니다.");
            break;

        default:
            System.out.println("잘못된 메뉴입니다.");
        }
    }

    public static void example4() {
        System.out.println("----------example");
        int score = 70;
        
        if(score >=90){
            System.out.println("A등급입니다.");
        } else if(score >=80){
            System.out.println("B등급입니다.");
        } else if(score >= 60){
            System.out.println("C등급입니다.");
        } else{
            System.out.println("D등급입니다.");
        }
    }
}